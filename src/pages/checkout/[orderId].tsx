// React / Next
import { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

// Hooks
import { useNostr } from "~/contexts/Nostr";
import { useOrder } from "~/contexts/Order";

// Components
import QRCode from "react-qr-code";
import QRModal from "~/components/QRModal";

export default function Home() {
  // Hooks
  const {
    query: { orderId: queryOrderId },
  } = useRouter();
  const { getEvent } = useNostr();

  const {
    orderId,
    currentInvoice: invoice,
    setCurrentInvoice,
    requestZapInvoice,
    setOrderEvent,
    amount,
    fiatAmount,
    pendingAmount,
  } = useOrder();

  // State Hooks
  const [isLoading, setIsLoading] = useState(true);
  useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch order if not already fetched
  useEffect(() => {
    if (!queryOrderId) {
      return;
    }

    if (queryOrderId === orderId) {
      console.info("Order already fetched");
      setIsLoading(false);
      return;
    }

    console.info("Fetching order...");
    void getEvent!(queryOrderId as string)
      .then((event) => {
        console.info("getEvent!", queryOrderId);
        if (!event) {
          alert("Order not found");
          setIsLoading(false);
          return;
        }

        console.info("Setting new order");
        setOrderEvent!(event);
        setIsLoading(false);
      })
      .catch((e) => {
        console.error("Error fetching order", e);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryOrderId]);

  // On mount
  useEffect(() => {
    if (pendingAmount === 0) {
      return;
    }
    void refreshInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAmount]);

  const refreshInvoice = useCallback(async () => {
    console.info("pendingAmount", pendingAmount);
    if (!pendingAmount || !orderId) {
      return;
    }

    const invoice = await requestZapInvoice!(pendingAmount * 1000, orderId);
    setCurrentInvoice!(invoice);
  }, [orderId, pendingAmount, requestZapInvoice, setCurrentInvoice]);

  return (
    <>
      <Head>
        <title>La Crypta - Checkout</title>
        <meta name="description" content="La Crypta Elecciones 2023" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="relative flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-6 px-4 py-6 ">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-[3rem]">
            La Crypta - Elecciones 2023
          </h1>
          {isLoading ? (
            <div>Cargando...</div>
          ) : (
            <div>
              <div className="bg-white px-4 py-12 text-5xl text-black md:px-24">
                {pendingAmount <= 0 ? (
                  <div>Pagado</div>
                ) : (
                  <>
                    <a href={`lightning://${invoice}`}>
                      <QRCode width={"200%"} value={invoice ?? "nothing"} />
                    </a>
                    <div className="">
                      <textarea className="w-full text-sm" value={invoice} />
                    </div>
                  </>
                )}
              </div>
              <div className="text-3xl">ARS {fiatAmount}</div>
              <div className="text-4xl">{amount} sats</div>
            </div>
          )}
        </div>
        <QRModal
          data={
            orderId ? `https://primal.net/e/${orderId}` : ""
            // orderId ? `https://snort.social/e/${nip19.noteEncode(orderId)}` : ""
          }
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          label="Escaneá para zappear desde Coracle"
          title="Post de Nostr"
        />
      </main>
    </>
  );
}
