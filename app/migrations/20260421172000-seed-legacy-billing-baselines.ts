import Decimal from "decimal.js";
import type { Db, ObjectId } from "mongodb";
import type {
  MigrationFile,
  MigrationResult,
} from "~/modules/migrations/types";

async function sumField(
  db: Db,
  collectionName: string,
  match: Record<string, unknown>,
  field: string,
): Promise<number> {
  const result = await db
    .collection(collectionName)
    .aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: `$${field}` } } },
    ])
    .toArray();

  return result[0]?.total ?? 0;
}

async function getLegacyMarkupRate(
  db: Db,
  teamId: ObjectId,
  asOf: Date,
): Promise<number | null> {
  const assignment = await db
    .collection("teambillingplans")
    .find({ team: teamId, effectiveFrom: { $lte: asOf } })
    .sort({ effectiveFrom: -1 })
    .limit(1)
    .next();

  if (!assignment?.plan) return null;

  const plan = await db.collection("billingplans").findOne({
    _id: assignment.plan,
  });

  return typeof plan?.markupRate === "number" ? plan.markupRate : null;
}

async function getLegacyCarryForwardBalance(
  db: Db,
  teamId: ObjectId,
): Promise<number> {
  const now = new Date();
  const markupRate = await getLegacyMarkupRate(db, teamId, now);

  if (markupRate === null) return 0;

  const lastClosed = await db
    .collection("billingperiods")
    .find({ team: teamId, status: "closed" })
    .sort({ endAt: -1 })
    .limit(1)
    .next();

  if (lastClosed?.endAt) {
    const since = new Date(lastClosed.endAt);
    const [creditsSince, costsSince] = await Promise.all([
      sumField(
        db,
        "teamcredits",
        { team: teamId, createdAt: { $gte: since }, isLegacy: true },
        "amount",
      ),
      sumField(
        db,
        "llmcosts",
        { team: teamId, createdAt: { $gte: since }, isLegacy: true },
        "cost",
      ),
    ]);

    return new Decimal(lastClosed.closingBalance ?? 0)
      .plus(creditsSince)
      .minus(new Decimal(costsSince).times(markupRate))
      .toNumber();
  }

  const [credits, costs] = await Promise.all([
    sumField(db, "teamcredits", { team: teamId, isLegacy: true }, "amount"),
    sumField(db, "llmcosts", { team: teamId, isLegacy: true }, "cost"),
  ]);

  return new Decimal(credits)
    .minus(new Decimal(costs).times(markupRate))
    .toNumber();
}

async function getLedgerNetBalance(db: Db, teamId: ObjectId): Promise<number> {
  const result = await db
    .collection("billingledgerentries")
    .aggregate([
      { $match: { team: teamId } },
      {
        $group: {
          _id: null,
          credits: {
            $sum: {
              $cond: [{ $eq: ["$direction", "credit"] }, "$amount", 0],
            },
          },
          debits: {
            $sum: {
              $cond: [{ $eq: ["$direction", "debit"] }, "$amount", 0],
            },
          },
        },
      },
    ])
    .toArray();

  return new Decimal(result[0]?.credits ?? 0)
    .minus(result[0]?.debits ?? 0)
    .toNumber();
}

async function getLatestLedgerEntryAt(
  db: Db,
  teamId: ObjectId,
): Promise<Date | undefined> {
  const latestEntry = await db
    .collection("billingledgerentries")
    .find({ team: teamId })
    .sort({ createdAt: -1 })
    .limit(1)
    .next();

  return latestEntry?.createdAt;
}

export default {
  id: "20260421172000-seed-legacy-billing-baselines",
  name: "Seed Legacy Billing Baselines",
  description:
    "Seeds one legacy carry-forward ledger entry and authoritative team balance per team.",

  async up(db: Db): Promise<MigrationResult> {
    console.log("Starting Seed Legacy Billing Baselines migration...");

    const teams = await db
      .collection("teams")
      .find({}, { projection: { _id: 1 } })
      .toArray();

    console.log(`Found ${teams.length} team(s)`);

    let insertedLedgerEntries = 0;
    let insertedBalances = 0;
    let failed = 0;

    for (const team of teams) {
      const teamId = team._id;
      const idempotencyKey = `legacy-balance:${teamId.toString()}`;

      try {
        const [existingBaseline, legacyBalance, ledgerNetBefore] =
          await Promise.all([
            db.collection("billingledgerentries").findOne({ idempotencyKey }),
            getLegacyCarryForwardBalance(db, teamId),
            getLedgerNetBalance(db, teamId),
          ]);

        let ledgerNet = ledgerNetBefore;
        let lastLedgerEntryAt = await getLatestLedgerEntryAt(db, teamId);

        if (!existingBaseline) {
          const now = new Date();

          await db.collection("billingledgerentries").insertOne({
            team: teamId,
            direction: "credit",
            amount: legacyBalance,
            currency: "USD",
            source: "legacy-migration",
            sourceId: teamId.toString(),
            idempotencyKey,
            metadata: {
              seededByMigration: true,
            },
            isLegacy: true,
            legacyNotes: "cutover carry-forward balance",
            createdAt: now,
          });

          insertedLedgerEntries++;
          ledgerNet = new Decimal(ledgerNetBefore)
            .plus(legacyBalance)
            .toNumber();
          lastLedgerEntryAt = now;
        }

        const balanceResult = await db
          .collection("teambillingbalances")
          .updateOne(
            { team: teamId },
            {
              $setOnInsert: {
                availableBalance: ledgerNet,
                lastLedgerEntryAt,
                version: 0,
                updatedAt: new Date(),
              },
            },
            { upsert: true },
          );

        if (balanceResult.upsertedCount > 0) {
          insertedBalances++;
        }
      } catch (error) {
        console.error(
          `Failed to seed legacy baseline for team ${teamId}:`,
          error,
        );
        failed++;
      }
    }

    console.log(
      `Done: inserted ${insertedLedgerEntries} baseline ledger entr${insertedLedgerEntries === 1 ? "y" : "ies"} and ${insertedBalances} balance doc(s)`,
    );

    return {
      success: failed === 0,
      message: `Inserted ${insertedLedgerEntries} baseline ledger entr${insertedLedgerEntries === 1 ? "y" : "ies"} and ${insertedBalances} balance doc(s)`,
      stats: {
        migrated: insertedLedgerEntries + insertedBalances,
        failed,
        insertedLedgerEntries,
        insertedBalances,
      },
    };
  },
} satisfies MigrationFile;
