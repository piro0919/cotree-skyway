import { useRef, useState, useEffect, Dispatch, SetStateAction } from "react";
import Peer, { MediaConnection } from "skyway-js";

export type VideoProps = {
  peer?: Peer;
  remoteId?: string;
  setEnabledPeer: Dispatch<SetStateAction<boolean>>;
  setMediaConnection: Dispatch<SetStateAction<MediaConnection | undefined>>;
};

function Video({
  peer,
  remoteId,
  setEnabledPeer,
  setMediaConnection,
}: VideoProps): JSX.Element {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream>();

  useEffect(() => {
    if (!peer || !peer.open || !localStream || !remoteId) {
      return;
    }

    const mediaConnection = peer.call(remoteId, localStream);

    mediaConnection.on("stream", (stream) => {
      if (!remoteVideoRef.current) {
        return;
      }

      remoteVideoRef.current.srcObject = stream;
      remoteVideoRef.current.play().catch(console.error);
    });
    mediaConnection.once("close", () => {
      if (
        !remoteVideoRef.current ||
        !remoteVideoRef.current.srcObject ||
        !("getTracks" in remoteVideoRef.current.srcObject)
      ) {
        return;
      }

      remoteVideoRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop());
      remoteVideoRef.current.srcObject = null;
    });

    setMediaConnection(mediaConnection);
  }, [localStream, peer, remoteId, setMediaConnection]);

  useEffect(() => {
    if (!localStream || !localVideoRef.current) {
      return;
    }

    localVideoRef.current.srcObject = localStream;
    localVideoRef.current
      .play()
      // .then(() => {
      //   const peer = new Peer({
      //     key: "3d67f156-917a-4260-bbfa-f9e81ff9f31a",
      //     debug: 3,
      //   });

      //   setPeer(peer);
      // })
      .then(() => {
        setEnabledPeer(true);
      })
      .catch(console.error);
  }, [localStream, setEnabledPeer]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .then((localStream) => {
        setLocalStream(localStream);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!peer) {
      return;
    }

    peer.on("call", (mediaConnection) => {
      mediaConnection.answer(localStream);
      mediaConnection.on("stream", (stream) => {
        if (!remoteVideoRef.current) {
          return;
        }

        remoteVideoRef.current.srcObject = stream;

        remoteVideoRef.current.play().catch(console.error);
      });
      mediaConnection.once("close", () => {
        if (
          !remoteVideoRef.current ||
          !remoteVideoRef.current.srcObject ||
          !("getTracks" in remoteVideoRef.current.srcObject)
        ) {
          return;
        }

        remoteVideoRef.current.srcObject
          .getTracks()
          .forEach((track) => track.stop());
        remoteVideoRef.current.srcObject = null;
      });

      setMediaConnection(mediaConnection);
    });
  }, [localStream, peer, setMediaConnection]);

  return (
    <div>
      <video
        muted={true}
        ref={localVideoRef}
        width="400px"
        playsInline={true}
      />
      <video
        muted={process.env.NODE_ENV === "development"}
        ref={remoteVideoRef}
        width="400px"
        playsInline={true}
      />
    </div>
  );
}

export default Video;
