export {};

if (process.env.OTEL_ENABLED === "true") {
  const { NodeSDK } = await import("@opentelemetry/sdk-node");
  const { getNodeAutoInstrumentations } =
    await import("@opentelemetry/auto-instrumentations-node");
  const { OTLPTraceExporter } =
    await import("@opentelemetry/exporter-trace-otlp-proto");
  const { OTLPMetricExporter } =
    await import("@opentelemetry/exporter-metrics-otlp-proto");
  const { PeriodicExportingMetricReader } =
    await import("@opentelemetry/sdk-metrics");
  const { resourceFromAttributes } = await import("@opentelemetry/resources");
  const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } =
    await import("@opentelemetry/semantic-conventions");
  const { BullMQInstrumentation } =
    await import("@appsignal/opentelemetry-instrumentation-bullmq");
  const { diag, DiagConsoleLogger, DiagLogLevel } =
    await import("@opentelemetry/api");

  if (process.env.OTEL_DEBUG === "true") {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
  }

  const serviceName = process.env.OTEL_SERVICE_NAME || "pipeline-app";
  const otlpEndpoint =
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318";

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: "1.0.0",
    "deployment.environment.name": process.env.NODE_ENV || "development",
  });

  const sdk = new NodeSDK({
    resource,
    traceExporter: new OTLPTraceExporter({
      url: `${otlpEndpoint}/v1/traces`,
    }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: `${otlpEndpoint}/v1/metrics`,
      }),
      exportIntervalMillis: 30000,
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-fs": { enabled: false },
        "@opentelemetry/instrumentation-dns": { enabled: false },
        "@opentelemetry/instrumentation-net": { enabled: false },
      }),
      new BullMQInstrumentation(),
    ],
  });

  sdk.start();
  console.log(`[otel] Instrumentation started for ${serviceName}`);

  const shutdown = async () => {
    try {
      await sdk.shutdown();
    } catch (err) {
      console.error("[otel] Shutdown error", err);
    }
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
