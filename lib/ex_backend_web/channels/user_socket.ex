defmodule ExBackendWeb.UserSocket do
  use Phoenix.Socket

  ## Channels
  channel("browser:*", ExBackendWeb.BrowserChannel)
  channel("notifications:*", ExBackendWeb.NotificationChannel)
  channel("watch:*", ExBackendWeb.WatchChannel)

  ## Transports
  transport(:websocket, Phoenix.Transports.WebSocket)
  # transport :longpoll, Phoenix.Transports.LongPoll

  # Socket params are passed from the client and can
  # be used to verify and authenticate a user. After
  # verification, you can put default assigns into
  # the socket that will be set for all channels, ie
  #
  #     {:ok, assign(socket, :user_id, verified_user_id)}
  #
  # To deny connection, return `:error`.
  #
  # See `Phoenix.Token` documentation for examples in
  # performing token verification on connect.
  def connect(params, socket) do
    token = Map.get(params, "userToken")

    socket =
      case Map.get(params, "identifier") do
        nil -> socket
        identifier -> assign(socket, :identifier, identifier)
      end

    case Phauxth.Token.verify(ExBackendWeb.Endpoint, token, 4 * 60 * 60) do
      {:ok, verified_user_id} ->
        {:ok, assign(socket, :user_id, verified_user_id)}

      _ ->
        :error
    end
  end

  # Socket id's are topics that allow you to identify all sockets for a given user:
  #
  #     def id(socket), do: "user_socket:#{socket.assigns.user_id}"
  #
  # Would allow you to broadcast a "disconnect" event and terminate
  # all active sockets and channels for a given user:
  #
  #     ExBackendWeb.Endpoint.broadcast("user_socket:#{user.id}", "disconnect", %{})
  #
  # Returning `nil` makes this socket anonymous.
  def id(_socket), do: nil
end
