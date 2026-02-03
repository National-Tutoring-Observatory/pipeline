import mongoose from "mongoose";
import evaluationSchema from "~/lib/schemas/evaluation.schema";
import type { Evaluation } from "./evaluations.types";

const EvaluationModel = mongoose.model("Evaluation", evaluationSchema);

export class EvaluationService {
  private static toEvaluation(doc: any): Evaluation {
    return doc.toJSON({ flattenObjectIds: true });
  }

  static async findById(id: string | undefined): Promise<Evaluation | null> {
    if (!id) return null;
    const doc = await EvaluationModel.findById(id);
    return doc ? this.toEvaluation(doc) : null;
  }

  static async create(data: Partial<Evaluation>): Promise<Evaluation> {
    const doc = await EvaluationModel.create(data);
    return this.toEvaluation(doc);
  }

  static async updateById(
    id: string,
    updates: Partial<Evaluation>,
  ): Promise<Evaluation | null> {
    const doc = await EvaluationModel.findByIdAndUpdate(id, updates, {
      new: true,
    });
    return doc ? this.toEvaluation(doc) : null;
  }

  static async deleteById(id: string): Promise<Evaluation | null> {
    const doc = await EvaluationModel.findByIdAndDelete(id);
    return doc ? this.toEvaluation(doc) : null;
  }
}
