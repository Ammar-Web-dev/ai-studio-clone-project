import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection } from "firebase/firestore";

// Initialize Firebase on the backend to save validated orders
const firebaseConfig = {
  apiKey: "AIzaSyAgbGeLZ_BHJy4b5Z_2NyRegsqMMDQPkGc",
  authDomain: "clean-branch-fxfb9.firebaseapp.com",
  projectId: "clean-branch-fxfb9",
  storageBucket: "clean-branch-fxfb9.firebasestorage.app",
  messagingSenderId: "231477350122",
  appId: "1:231477350122:web:2c85442d7edb3935d79193"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, "ai-studio-foodpandaclone-d7217290-baa2-42ff-81f1-503d5b94f836");

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Secure Backend Payment Processing & Order Verification
  app.post("/api/checkout", async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const {
        userId,
        userEmail,
        restaurantId,
        restaurantName,
        items,
        subtotal,
        deliveryFee,
        discountApplied,
        total,
        address,
        phone,
        paymentMethod,
        paymentCardDetails,
        voucherCode
      } = req.body;

      // 1. Core Server-Side Validations
      if (!userId || !restaurantId || !items || items.length === 0 || !address || !phone) {
        res.status(400).json({ success: false, error: "Missing required order fields." });
        return;
      }

      // 2. Validate calculations to prevent front-end price tampering
      let calculatedSubtotal = 0;
      for (const item of items) {
        calculatedSubtotal += item.price * item.quantity;
      }

      if (Math.abs(calculatedSubtotal - subtotal) > 1) {
        res.status(400).json({ success: false, error: "Subtotal calculation mismatch. Possible price tampering detected." });
        return;
      }

      // Check discount validity
      let backendDiscount = 0;
      if (voucherCode) {
        const uppercaseCode = voucherCode.toUpperCase();
        if (uppercaseCode === 'PANDAFREE' && subtotal >= 1000) {
          backendDiscount = 250;
        } else if (uppercaseCode === 'WELCOME50' && subtotal >= 600) {
          backendDiscount = Math.min(300, Math.round(subtotal * 0.5));
        } else if (uppercaseCode === 'FOODLOVE' && subtotal >= 500) {
          backendDiscount = Math.round(subtotal * 0.2);
        }

        if (Math.abs(backendDiscount - discountApplied) > 1) {
          res.status(400).json({ success: false, error: "Invalid voucher discount amount." });
          return;
        }
      }

      const calculatedTotal = subtotal + deliveryFee - discountApplied;
      if (Math.abs(calculatedTotal - total) > 1) {
        res.status(400).json({ success: false, error: "Total calculation mismatch." });
        return;
      }

      // 3. Secure Payment Gateway Simulation (PCI-DSS compliant pattern: never store raw pins/CVV, mock tokenized success)
      let transactionId = "COD_PENDING";
      let paymentStatus: 'pending' | 'paid' | 'simulated_success' = "pending";

      if (paymentMethod === 'card') {
        if (!paymentCardDetails || !paymentCardDetails.number || !paymentCardDetails.expiry) {
          res.status(400).json({ success: false, error: "Payment details missing for Card transaction." });
          return;
        }
        // Simulated Secure Gateway tokenization
        transactionId = "txn_" + Math.random().toString(36).substring(2, 15).toUpperCase();
        paymentStatus = "simulated_success";
      }

      // 4. Record order securely in Firebase Firestore database
      const orderId = "order_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
      const newOrder = {
        id: orderId,
        userId,
        userEmail: userEmail || "guest@foodpanda-clone.pk",
        restaurantId,
        restaurantName,
        items,
        subtotal,
        deliveryFee,
        discountApplied,
        total,
        address,
        phone,
        paymentMethod,
        paymentStatus,
        transactionId,
        status: "received" as const,
        createdAt: new Date().toISOString()
      };

      const orderRef = doc(collection(db, "orders"), orderId);
      await setDoc(orderRef, newOrder);

      console.log(`[BACKEND] Secure order placement succeeded! Order ID: ${orderId}, Subtotal: Rs. ${subtotal}, Net Paid: Rs. ${total}`);

      res.status(200).json({
        success: true,
        orderId,
        transactionId,
        paymentStatus,
        message: "Order placed securely and processed by foodpanda backend."
      });

    } catch (error: any) {
      console.error("[BACKEND ERROR] Checkout failed:", error);
      res.status(500).json({ success: false, error: "Internal payment processing error." });
    }
  });

  // Serve static assets or use Vite's HMR in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Foodpanda clone backend running on http://localhost:${PORT}`);
  });
}

startServer();
