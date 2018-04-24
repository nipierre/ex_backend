defmodule ExSubtilBackend.Amqp.JobFFmpegErrorConsumer do
  require Logger

  alias ExSubtilBackend.Jobs.Status

  use ExSubtilBackend.Amqp.CommonConsumer, %{
    queue: "job_ffmpeg_error",
    consumer: &ExSubtilBackend.Amqp.JobFFmpegErrorConsumer.consume/4
  }

  def consume(channel, tag, _redelivered, %{"job_id" => job_id, "error" => description} = payload) do
    Logger.error("FFmpeg error #{inspect(payload)}")
    Status.set_job_status(job_id, "error", %{message: description})
    Basic.ack(channel, tag)
  end
end
