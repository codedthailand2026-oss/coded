/**
 * Setup Profile Page
 *
 * หน้านี้จะถูกเรียกอัตโนมัติเมื่อ:
 * - User login แล้วแต่ไม่มี profile ใน database
 * - Trigger ไม่ทำงาน หรือ user ถูกลบออกจาก DB
 *
 * Flow:
 * 1. แสดง loading screen
 * 2. เรียก API เพื่อสร้าง profile, subscription, credits อัตโนมัติ
 * 3. ถ้าสำเร็จ redirect ไป home
 * 4. ถ้า error แสดงข้อความและปุ่ม retry
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SetupProfilePage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState("");

  const setupProfile = async () => {
    try {
      setStatus("loading");
      setErrorMessage("");

      const response = await fetch("/api/setup-profile", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error?.message || "Failed to setup profile"
        );
      }

      // สำเร็จ - redirect ไป home
      setStatus("success");
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error("Setup profile error:", error);
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "An error occurred"
      );
    }
  };

  // Auto-run เมื่อโหลดหน้า
  useEffect(() => {
    setupProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
            <h1 className="text-2xl font-bold mb-2">Setting up your account</h1>
            <p className="text-gray-600">
              Please wait while we prepare your profile...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-green-600">
              All set!
            </h1>
            <p className="text-gray-600">Redirecting to homepage...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-red-600">
              Setup Failed
            </h1>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <div className="space-y-3">
              <Button onClick={setupProfile} className="w-full">
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/login")}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
