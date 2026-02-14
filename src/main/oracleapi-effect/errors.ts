import { Schema } from 'effect'

export class APIHTTPError extends Schema.TaggedError<APIHTTPError>()('APIHTTPError', {
  endpoint: Schema.String,
  status: Schema.Number,
  statusText: Schema.String,
  body: Schema.String
}) {}

export class APINetworkError extends Schema.TaggedError<APINetworkError>()('APINetworkError', {
  endpoint: Schema.String,
  cause: Schema.Defect
}) {}

export class APIDecoderError extends Schema.TaggedError<APIDecoderError>()('APIDecoderError', {
  endpoint: Schema.String,
  cause: Schema.Defect
}) {}
