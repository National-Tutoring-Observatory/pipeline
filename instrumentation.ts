export {};

if (process.env.OTEL_ENABLED === "true") {
  const { NodeSDK } = await import("@opentelemetry/sdk-node");
  const { HttpInstrumentation } =
    await import("@opentelemetry/instrumentation-http");
  const { ExpressInstrumentation } =
    await import("@opentelemetry/instrumentation-express");
  const { IORedisInstrumentation } =
    await import("@opentelemetry/instrumentation-ioredis");
  const { MongoDBInstrumentation } =
    await import("@opentelemetry/instrumentation-mongodb");
  const { MongooseInstrumentation } =
    await import("@opentelemetry/instrumentation-mongoose");
  const { SocketIoInstrumentation } =
    await import("@opentelemetry/instrumentation-socket.io");
  const { UndiciInstrumentation } =
    await import("@opentelemetry/instrumentation-undici");
  const { RuntimeNodeInstrumentation } =
    await import("@opentelemetry/instrumentation-runtime-node");
  const { AwsInstrumentation } =
    await import("@opentelemetry/instrumentation-aws-sdk");
  const { OpenAIInstrumentation } =
    await import("@opentelemetry/instrumentation-openai");
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

  const serviceName = process.env.OTEL_SERVICE_NAME || "sandpiper-app";
  const otlpEndpoint =
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318";

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: "1.0.0",
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
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
      new IORedisInstrumentation(),
      new MongoDBInstrumentation(),
      new MongooseInstrumentation(),
      new SocketIoInstrumentation(),
      new UndiciInstrumentation(),
      new RuntimeNodeInstrumentation(),
      new AwsInstrumentation(),
      new OpenAIInstrumentation(),
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
