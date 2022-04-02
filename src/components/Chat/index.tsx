import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import Peer, { DataConnection } from "skyway-js";

type FieldValues = {
  localText: string;
};

export type ChatProps = {
  dataConnection?: DataConnection;
  peer?: Peer;
  remoteId?: string;
  setDataConnection: Dispatch<SetStateAction<DataConnection | undefined>>;
};

function Chat({
  dataConnection,
  peer,
  remoteId,
  setDataConnection,
}: ChatProps): JSX.Element {
  const [messages, setMessages] = useState("");
  const { handleSubmit, register, setValue } = useForm<FieldValues>({
    defaultValues: {
      localText: "",
    },
  });
  const onSubmit = useCallback<SubmitHandler<FieldValues>>(
    ({ localText }) => {
      if (!dataConnection || !dataConnection.open) {
        return;
      }

      dataConnection.send(localText);

      setMessages((prevMessages) => `${prevMessages}${localText}\n`);

      setValue("localText", "");
    },
    [dataConnection, setValue]
  );

  useEffect(() => {
    if (!peer || !peer.open || !remoteId) {
      return;
    }

    const dataConnection = peer.connect(remoteId);

    dataConnection.once("open", async () => {
      setMessages(
        (prevMessages) =>
          `${prevMessages}=== DataConnection has been opened ===\n`
      );
    });

    dataConnection.on("data", (data) => {
      setMessages((prevMessages) => `${prevMessages}Remote: ${data}\n`);
    });

    dataConnection.once("close", () => {
      setMessages(
        (prevMessages) =>
          `${prevMessages}=== DataConnection has been closed ===\n`
      );
    });

    setDataConnection(dataConnection);
  }, [peer, remoteId, setDataConnection]);

  useEffect(() => {
    if (!peer) {
      return;
    }

    peer.on("connection", (dataConnection) => {
      dataConnection.once("open", async () => {
        setMessages(
          (prevMessages) =>
            `${prevMessages}=== DataConnection has been opened ===\n`
        );
      });

      dataConnection.on("data", (data) => {
        setMessages((prevMessages) => `${prevMessages}Remote: ${data}\n`);
      });

      dataConnection.once("close", () => {
        setMessages(
          (prevMessages) =>
            `${prevMessages}=== DataConnection has been closed ===\n`
        );
      });

      setDataConnection(dataConnection);
    });
  }, [peer, setDataConnection]);

  return (
    <div>
      <pre>{messages}</pre>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register("localText", { required: true })} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;
