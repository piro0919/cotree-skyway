import Chat from "components/Chat";
import Form, { FormProps } from "components/Form";
import Video, { VideoProps } from "components/Video";
import { MouseEventHandler, useCallback, useEffect, useState } from "react";
import Peer, { DataConnection, MediaConnection } from "skyway-js";

function Pages() {
  const [peer, setPeer] = useState<Peer>();
  const [localId, setLocalId] = useState("");
  const [enabledPeer, setEnabledPeer] = useState(false);
  const [remoteId, setRemoteId] = useState<VideoProps["remoteId"]>();
  const handleSubmit = useCallback<FormProps["onSubmit"]>(({ remoteId }) => {
    setRemoteId(remoteId);
  }, []);
  const [dataConnection, setDataConnection] = useState<DataConnection>();
  const [mediaConnection, setMediaConnection] = useState<MediaConnection>();
  const handleClose = useCallback<MouseEventHandler<HTMLButtonElement>>(() => {
    if (dataConnection && dataConnection.open) {
      dataConnection.close(true);
    }

    if (mediaConnection && mediaConnection.open) {
      mediaConnection.close(true);
    }

    setRemoteId(undefined);
  }, [dataConnection, mediaConnection]);

  useEffect(() => {
    if (!peer || localId) {
      return;
    }

    peer.once("open", (id) => {
      setLocalId(id);
    });
  }, [localId, peer]);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SKY_WAY_API_KEY || !enabledPeer) {
      return;
    }

    const peer = new Peer({
      key: process.env.NEXT_PUBLIC_SKY_WAY_API_KEY,
      debug: process.env.NODE_ENV === "production" ? 0 : 3,
    });

    setPeer(peer);
  }, [enabledPeer]);

  useEffect(() => {
    if (!peer) {
      return;
    }

    peer.on("error", console.error);
  }, [peer]);

  return (
    <div>
      <p>{`Your ID: ${localId}`}</p>
      <Form onSubmit={handleSubmit} />
      <button onClick={handleClose}>Close</button>
      <Video
        peer={peer}
        remoteId={remoteId}
        setEnabledPeer={setEnabledPeer}
        setMediaConnection={setMediaConnection}
      />
      <Chat
        dataConnection={dataConnection}
        peer={peer}
        remoteId={remoteId}
        setDataConnection={setDataConnection}
      />
    </div>
  );
}

export default Pages;
