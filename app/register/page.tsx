"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import styles from "./register-form.module.css";
import initFirebaseClient, { createRecaptchaVerifier } from "../../lib/firebaseClient";
import type { ConfirmationResult } from "firebase/auth";

type RazorpayPaymentResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill: {
    contact?: string;
  };
  theme: {
    color: string;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
    };
    recaptchaVerifier?: unknown;
  }
}

const stepLabels = [
  "Personal Details",
  "Family Details",
  "Education & Career",
  "Residence",
  "Photos",
  "Partner Preferences",
  "Review & Submit",
];

const createdForOptions = ["Self", "Son", "Daughter", "Brother", "Sister", "Relative"];
const genderOptions = ["Male", "Female", "Other"];
const maritalOptions = ["Never Married", "Divorced", "Widowed"];
const manglikOptions = ["Manglik", "Non-Manglik", "Don't Know"];
const dietOptions = ["Vegetarian", "Non-Vegetarian", "Jain Vegetarian"];
const familyTypeOptions = ["Joint Family", "Nuclear Family"];
const familyValueOptions = ["Traditional", "Moderate", "Liberal"];

const defaultValues = {
  mobileNumber: "",
  otp: "",
  createdFor: "Self",
  fullName: "",
  gender: "Male",
  dateOfBirth: "",
  height: "",
  maritalStatus: "Never Married",
  manglikStatus: "Don't Know",
  dietPreference: "Vegetarian",
  fatherName: "",
  fatherOccupation: "",
  motherName: "",
  motherOccupation: "",
  numberOfBrothers: "0",
  numberOfSisters: "0",
  familyType: "Nuclear Family",
  familyValues: "Moderate",
  familyDescription: "",
  highestQualification: "",
  college: "",
  occupation: "",
  companyName: "",
  annualIncome: "",
  country: "",
  state: "",
  cityOrVillage: "",
  currentResidenceAddress: "",
  preferredGender: "Any",
  preferredAgeRange: "",
  preferredHeightRange: "",
  preferredReligion: "",
  preferredCaste: "",
  preferredLocation: "",
  confirmAccurate: false,
  acceptPrivacy: false,
  password: "",
};

const registrationSchema = z.object({
  mobileNumber: z
    .string()
    .min(10, "Enter a valid 10-digit mobile number")
    .regex(/^\d{10}$/, "Mobile number must contain only digits"),
  otp: z.string().optional(),
  createdFor: z.string().min(1),
  fullName: z.string().min(2, "Please enter full name"),
  gender: z.string().min(1),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  height: z.string().min(1, "Height is required (e.g., 5'8\")"),
  maritalStatus: z.string().min(1),
  manglikStatus: z.string().min(1),
  dietPreference: z.string().min(1),
  fatherName: z.string().min(1, "Father's name is required"),
  fatherOccupation: z.string().min(1, "Father's occupation is required"),
  motherName: z.string().min(1, "Mother's name is required"),
  motherOccupation: z.string().min(1, "Mother's occupation is required"),
  numberOfBrothers: z.string().min(1),
  numberOfSisters: z.string().min(1),
  familyType: z.string().min(1),
  familyValues: z.string().min(1),
  familyDescription: z.string().optional(),
  highestQualification: z.string().min(1, "Highest qualification is required"),
  college: z.string().optional(),
  occupation: z.string().min(1, "Occupation is required"),
  companyName: z.string().optional(),
  annualIncome: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  cityOrVillage: z.string().min(1, "City / Village is required"),
  currentResidenceAddress: z.string().min(1, "Address is required"),
  preferredGender: z.string().optional(),
  preferredAgeRange: z.string().optional(),
  preferredHeightRange: z.string().optional(),
  preferredReligion: z.string().optional(),
  preferredCaste: z.string().optional(),
  preferredLocation: z.string().optional(),
  confirmAccurate: z.boolean(),
  acceptPrivacy: z.boolean(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

type PhotoItem = {
  id: string;
  name: string;
  src: string;
  progress: number;
};

const STORAGE_KEY = "vardhman_matrimonial_registration";

function getAge(dob: string) {
  if (!dob) return "";
  const birthDate = new Date(dob);
  const now = new Date();
  let years = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    years -= 1;
  }
  return String(years);
}

async function compressImage(file: File) {
  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    });
    return compressed;
  } catch {
    return file;
  }
}

async function fileToDataUrl(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Unsupported file type"));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [photoItems, setPhotoItems] = useState<PhotoItem[]>([]);
  const [cropModal, setCropModal] = useState<PhotoItem | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isLoadingOtp, setIsLoadingOtp] = useState(false);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues,
    mode: "onTouched",
  });

  const { register, handleSubmit, watch, reset, trigger, formState, getValues } = form;
  const { errors } = formState;

  const watchAll = watch();
  const age = useMemo(() => getAge(watchAll.dateOfBirth), [watchAll.dateOfBirth]);

  const cropCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cropImageRef = useRef<HTMLImageElement | null>(null);

  const formProgress = currentStep === -1 ? 0 : ((currentStep + 1) / stepLabels.length) * 100;

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: {
      "image/*": [],
    },
    maxFiles: 5 - photoItems.length,
    noKeyboard: true,
    onDrop: async (acceptedFiles) => {
      if (!acceptedFiles.length) return;
      setUploadErrors(null);
      const nextPhotos: PhotoItem[] = [];
      const filePromises = acceptedFiles.slice(0, 5 - photoItems.length).map(async (file) => {
        const compressed = await compressImage(file);
        const src = await fileToDataUrl(compressed);
        return {
          id: `${file.name}-${Date.now()}`,
          name: file.name,
          src,
          progress: 100,
        };
      });
      const items = await Promise.all(filePromises);
      nextPhotos.push(...items);
      setPhotoItems((existing) => [...existing, ...nextPhotos].slice(0, 5));
    },
  });

  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const mobileVerified = window.localStorage.getItem("vardhman_mobile_verified") === "true";
      const storedIdToken = window.localStorage.getItem("vardhman_id_token");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.values) {
          reset(parsed.values);
          // If mobile is verified, start at step 0 (Personal Details), otherwise show OTP screen
          if (mobileVerified) {
            setCurrentStep(parsed.step ?? 0);
          } else {
            setCurrentStep(-1); // -1 indicates OTP-only screen
          }
          setOtpSent(parsed.otpSent ?? false);
          setOtpVerified(parsed.otpVerified ?? mobileVerified);
          setPhotoItems(parsed.photoItems ?? []);
        }
      } else {
        setOtpVerified(mobileVerified);
        // If mobile is verified, start at step 0, otherwise show OTP screen
        setCurrentStep(mobileVerified ? 0 : -1);
      }
      if (storedIdToken) {
        setIdToken(storedIdToken);
      }
    } catch {
      // ignore
    }
  }, [reset]);

  useEffect(() => {
    if (!isMounted) return;
    const payload = {
      values: getValues(),
      step: currentStep,
      otpSent,
      otpVerified,
      photoItems,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [getValues, currentStep, otpSent, otpVerified, photoItems, isMounted]);

  const handleSendOtp = async () => {
    if (isLoadingOtp) return;
    const valid = await trigger("mobileNumber");
    if (!valid) return;
    setIsLoadingOtp(true);
    setOtpError(null);
    const auth = initFirebaseClient();
    if (!auth) {
      setOtpError("Firebase client not configured (check NEXT_PUBLIC_FIREBASE_* env vars)");
      setIsLoadingOtp(false);
      return;
    }
    try {
      const verifier = createRecaptchaVerifier(auth);
      if (!verifier) {
        setOtpError("Unable to create Recaptcha verifier.");
        setIsLoadingOtp(false);
        return;
      }
      const phone = getValues().mobileNumber || "";
      const phoneNumber = phone.startsWith("+") ? phone : `+91${phone}`;
      const { signInWithPhoneNumber } = await import("firebase/auth");
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      confirmationRef.current = confirmation;
      setOtpSent(true);
      setOtpVerified(false);
      setIsLoadingOtp(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("OTP Error:", err);
      if (typeof window !== "undefined") {
        window.recaptchaVerifier = null;
      }
      setOtpError(message);
      setIsLoadingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = getValues().otp?.trim();
    if (!otpValue || otpValue.length !== 6) {
      setOtpError("Enter the 6-digit OTP sent to your phone.");
      setOtpVerified(false);
      return;
    }
    if (!confirmationRef.current) {
      setOtpError("No OTP request found. Please request OTP first.");
      return;
    }
    try {
      const result = await confirmationRef.current.confirm(otpValue);
      const token = await result.user.getIdToken();
      setIdToken(token);
      setOtpError(null);
      setOtpVerified(true);
      try {
        window.localStorage.setItem("vardhman_mobile_verified", "true");
        window.localStorage.setItem("vardhman_id_token", token);
      } catch {
        // ignore storage errors
      }
      // Move to Personal Details step (step 0) instead of redirecting to home
      setCurrentStep(0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid OTP. Please try again.";
      setOtpError(message);
      setOtpVerified(false);
    }
  };

  const validPhotoStep = photoItems.length >= 1;

  const canProceedStep = async (stepIndex: number) => {
    switch (stepIndex) {
      case -1: {
        // OTP-only screen
        const valid = await trigger("mobileNumber");
        if (!valid) return false;
        if (!otpVerified) return false;
        return true;
      }
      case 0:
        return await trigger([
          "createdFor",
          "fullName",
          "gender",
          "dateOfBirth",
          "height",
          "maritalStatus",
          "manglikStatus",
          "dietPreference",
        ]);
      case 1:
        return await trigger([
          "fatherName",
          "fatherOccupation",
          "motherName",
          "motherOccupation",
          "numberOfBrothers",
          "numberOfSisters",
          "familyType",
          "familyValues",
        ]);
      case 2:
        return await trigger(["highestQualification", "occupation"]);
      case 3:
        return await trigger(["country", "state", "cityOrVillage", "currentResidenceAddress"]);
      case 4:
        return validPhotoStep;
      default:
        return true;
    }
  };

  const goToStep = async (index: number) => {
    if (index === currentStep) return;
    const valid = await canProceedStep(currentStep);
    if (!valid) return;
    setCurrentStep(index);
  };

  const nextStep = async () => {
    const valid = await canProceedStep(currentStep);
    if (!valid) return;
    setCurrentStep((value) => Math.min(value + 1, stepLabels.length - 1));
  };

  const previousStep = () => {
    setCurrentStep((value) => Math.max(value - 1, -1));
  };

  const startPayment = async () => {
    setPaymentError(null);
    setIsPaying(true);
    try {
      const resp = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 25000, currency: "INR" }),
      });

      const json = (await resp.json()) as {
        error?: string;
        order?: { amount: number; currency: string; id: string };
        keyId?: string;
      };
      if (!resp.ok) {
        throw new Error(json?.error || "Unable to create payment order");
      }

      const orderId = json.order?.id;
      if (!orderId) {
        throw new Error("Payment order creation failed");
      }

      const razorpayOptions: RazorpayOptions = {
        key: json.keyId || "",
        amount: json.order.amount,
        currency: json.order.currency,
        name: "Vardhman Matrimonials",
        description: "Registration fee",
        order_id: orderId,
        handler: async (paymentResult: Record<string, string>) => {
          setIsPaying(false);
          try {
            await submitProfile(paymentResult, orderId);
          } catch (err: unknown) {
            setPaymentError(err instanceof Error ? err.message : String(err));
            setIsSubmitting(false);
          }
        },
        prefill: {
          contact: getValues().mobileNumber,
        },
        theme: {
          color: "#7a1f2b",
        },
      };

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        if (!window.Razorpay) {
          setPaymentError("Unable to launch payment checkout.");
          setIsPaying(false);
          return;
        }
        const rzp = new window.Razorpay(razorpayOptions);
        rzp.open();
      };
      script.onerror = () => {
        setPaymentError("Unable to load Razorpay checkout. Please try again.");
        setIsPaying(false);
      };
      document.body.appendChild(script);
    } catch (err: unknown) {
      setPaymentError(err instanceof Error ? err.message : String(err));
      setIsPaying(false);
    }
  };

  const submitProfile = async (paymentResult: Record<string, string>, orderId: string) => {
    setConfirmError(null);
    setIsSubmitting(true);
    const values = getValues();
    if (!values.confirmAccurate || !values.acceptPrivacy) {
      setConfirmError("Please accept both declarations to submit your profile.");
      setIsSubmitting(false);
      return;
    }
    if (photoItems.length < 1) {
      setConfirmError("Please upload at least one photo before submitting.");
      setCurrentStep(5);
      setIsSubmitting(false);
      return;
    }

    const payload = {
      mobileNumber: values.mobileNumber,
      password: values.password,
      values: { ...values },
      photos: photoItems,
      idToken,
      payment: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentResult.razorpay_payment_id,
        razorpay_signature: paymentResult.razorpay_signature,
      },
    };

    const resp = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await resp.json();
    if (!resp.ok) {
      setConfirmError(json?.error || "Failed to create account");
      setIsSubmitting(false);
      return;
    }

    try {
      window.localStorage.setItem("vardhman_user", JSON.stringify(json.profile || json.user || payload));
      window.localStorage.setItem("vardhman_paid", "true");
      window.localStorage.setItem("vardhman_profile_submitted", JSON.stringify(json.profile || json.user || payload));
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.setItem("vardhman_mobile_verified", "true");
    } catch {
      // ignore storage errors
    }

    router.push("/dashboard");
  };

  const onSubmit = async () => {
    setConfirmError(null);
    if (!idToken) {
      setConfirmError("Please verify your mobile number before proceeding.");
      setCurrentStep(-1);
      setIsSubmitting(false);
      return;
    }
    await startPayment();
  };

  const handlePhotoCrop = async (item: PhotoItem) => {
    setCropModal(item);
    setCropZoom(1);
  };

  const applyCrop = async () => {
    if (!cropModal || !cropImageRef.current || !cropCanvasRef.current) return;
    const image = cropImageRef.current;
    const canvas = cropCanvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    const targetSize = Math.min(image.naturalWidth, image.naturalHeight);
    const cropSize = targetSize / cropZoom;
    const sx = (image.naturalWidth - cropSize) / 2;
    const sy = (image.naturalHeight - cropSize) / 2;
    canvas.width = 1000;
    canvas.height = 1000;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, sx, sy, cropSize, cropSize, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    if (!blob) return;
    const src = await fileToDataUrl(blob);
    setPhotoItems((items) =>
      items.map((next) => (next.id === cropModal.id ? { ...next, src } : next))
    );
    setCropModal(null);
  };

  const removePhoto = (id: string) => {
    setPhotoItems((items) => items.filter((item) => item.id !== id));
  };

  const renderMobileStep = () => (
    <div className={styles.fieldGrid}>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel} htmlFor="mobileNumber">
          Mobile Number *
        </label>
        <input
          id="mobileNumber"
          type="tel"
          inputMode="numeric"
          placeholder="Enter 10-digit mobile number"
          className={styles.inputField}
          {...register("mobileNumber")}
        />
        {errors.mobileNumber && <p className={styles.fieldError}>{errors.mobileNumber.message}</p>}
      </div>

      <div className={styles.fieldGroup}>
        <button type="button" className={styles.buttonSecondary} onClick={handleSendOtp} disabled={isLoadingOtp}>
          {isLoadingOtp ? "Sending..." : "Send OTP"}
        </button>
        <div id="recaptcha-container" />
        {otpSent && (
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="otp">
              Enter OTP
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              className={styles.inputField}
              {...register("otp")}
            />
            {otpError && <p className={styles.fieldError}>{otpError}</p>}
            {otpVerified ? (
              <p className={styles.inputNote} style={{ color: "#24632d" }}>
                OTP verified successfully. Click &quot;Verify & Continue&quot; to proceed.
              </p>
            ) : (
              <p className={styles.inputNote}>
                For testing, use OTP <strong>123456</strong>.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderPersonalStep = () => (
    <div className={styles.fieldGrid}>
      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="createdFor">
            Profile Created For *
          </label>
          <select id="createdFor" className={styles.selectField} {...register("createdFor")}> 
            {createdForOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="fullName">
            Full Name *
          </label>
          <input id="fullName" className={styles.inputField} {...register("fullName")} />
          {errors.fullName && <p className={styles.fieldError}>{errors.fullName.message}</p>}
        </div>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="gender">
            Gender *
          </label>
          <select id="gender" className={styles.selectField} {...register("gender")}> 
            {genderOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="dateOfBirth">
            Date of Birth *
          </label>
          <input id="dateOfBirth" type="date" className={styles.inputField} {...register("dateOfBirth")} />
          {errors.dateOfBirth && <p className={styles.fieldError}>{errors.dateOfBirth.message}</p>}
        </div>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="age">
            Age
          </label>
          <input id="age" className={styles.inputField} value={age} readOnly />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="height">
            Height *
          </label>
          <input id="height" placeholder="e.g. 5 ft 8 inches" className={styles.inputField} {...register("height")} />
          {errors.height && <p className={styles.fieldError}>{errors.height.message}</p>}
        </div>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="maritalStatus">
            Marital Status *
          </label>
          <select id="maritalStatus" className={styles.selectField} {...register("maritalStatus")}>
            {maritalOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="manglikStatus">
            Manglik Status *
          </label>
          <select id="manglikStatus" className={styles.selectField} {...register("manglikStatus")}>
            {manglikOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="dietPreference">
            Diet Preference *
          </label>
          <select id="dietPreference" className={styles.selectField} {...register("dietPreference")}>
            {dietOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderFamilyStep = () => (
    <div className={styles.fieldGrid}>
      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="fatherName">
            Father&apos;s Name *
          </label>
          <input id="fatherName" className={styles.inputField} {...register("fatherName")} />
          {errors.fatherName && <p className={styles.fieldError}>{errors.fatherName.message}</p>}
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="fatherOccupation">
            Father&apos;s Occupation *
          </label>
          <input id="fatherOccupation" className={styles.inputField} {...register("fatherOccupation")} />
          {errors.fatherOccupation && <p className={styles.fieldError}>{errors.fatherOccupation.message}</p>}
        </div>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="motherName">
            Mother&apos;s Name *
          </label>
          <input id="motherName" className={styles.inputField} {...register("motherName")} />
          {errors.motherName && <p className={styles.fieldError}>{errors.motherName.message}</p>}
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="motherOccupation">
            Mother&apos;s Occupation *
          </label>
          <input id="motherOccupation" className={styles.inputField} {...register("motherOccupation")} />
          {errors.motherOccupation && <p className={styles.fieldError}>{errors.motherOccupation.message}</p>}
        </div>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="numberOfBrothers">
            Number of Brothers *
          </label>
          <input id="numberOfBrothers" type="number" min="0" className={styles.inputField} {...register("numberOfBrothers")} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="numberOfSisters">
            Number of Sisters *
          </label>
          <input id="numberOfSisters" type="number" min="0" className={styles.inputField} {...register("numberOfSisters")} />
        </div>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="familyType">
            Family Type *
          </label>
          <select id="familyType" className={styles.selectField} {...register("familyType")}> 
            {familyTypeOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="familyValues">
            Family Values *
          </label>
          <select id="familyValues" className={styles.selectField} {...register("familyValues")}>
            {familyValueOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      {watchAll.familyType === "Nuclear Family" && (
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="familyDescription">
            Tell us more about your family
            <span className={styles.optionalLabel}>optional</span>
          </label>
          <textarea id="familyDescription" className={styles.textareaField} placeholder="Share details about your family background, traditions, etc." {...register("familyDescription")} />
        </div>
      )}
    </div>
  );

  const renderEducationStep = () => (
    <div className={styles.fieldGrid}>
      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="highestQualification">
            Highest Qualification *
          </label>
          <input id="highestQualification" className={styles.inputField} {...register("highestQualification")} />
          {errors.highestQualification && <p className={styles.fieldError}>{errors.highestQualification.message}</p>}
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="college">
            College / University
            <span className={styles.optionalLabel}>optional</span>
          </label>
          <input id="college" className={styles.inputField} {...register("college")} />
        </div>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="occupation">
            Occupation *
          </label>
          <input id="occupation" className={styles.inputField} {...register("occupation")} />
          {errors.occupation && <p className={styles.fieldError}>{errors.occupation.message}</p>}
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="companyName">
            Company / Business Name
            <span className={styles.optionalLabel}>optional</span>
          </label>
          <input id="companyName" className={styles.inputField} {...register("companyName")} />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel} htmlFor="annualIncome">
          Annual Income (INR)
          <span className={styles.optionalLabel}>optional</span>
        </label>
        <input id="annualIncome" placeholder="e.g. ₹12,00,000" className={styles.inputField} {...register("annualIncome")} />
      </div>
    </div>
  );

  const renderResidenceStep = () => (
    <div className={styles.fieldGrid}>
      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="country">
            Country *
          </label>
          <input id="country" className={styles.inputField} {...register("country")} />
          {errors.country && <p className={styles.fieldError}>{errors.country.message}</p>}
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="state">
            State *
          </label>
          <input id="state" className={styles.inputField} {...register("state")} />
          {errors.state && <p className={styles.fieldError}>{errors.state.message}</p>}
        </div>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="cityOrVillage">
            City / Village *
          </label>
          <input id="cityOrVillage" className={styles.inputField} {...register("cityOrVillage")} />
          {errors.cityOrVillage && <p className={styles.fieldError}>{errors.cityOrVillage.message}</p>}
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="currentResidenceAddress">
            Current Residence Address *
          </label>
          <textarea id="currentResidenceAddress" className={styles.textareaField} {...register("currentResidenceAddress")} />
          {errors.currentResidenceAddress && <p className={styles.fieldError}>{errors.currentResidenceAddress.message}</p>}
        </div>
      </div>

      <p className={styles.inputNote}>
        Your complete address and phone number will remain private.
      </p>
    </div>
  );

  const renderPhotoStep = () => (
    <div className={styles.photoUploadPanel}>
      <div className={styles.photoUploadDropzone} {...getRootProps()}>
        <input {...getInputProps()} />
        <p>
          {isDragActive
            ? "Drop photos here to upload"
            : "Drag & drop up to 5 photos here, or click to browse"}
        </p>
        <p className={styles.optionalLabel}>Minimum 1 photo required for better responses.</p>
      </div>
      {uploadErrors && <p className={styles.fieldError}>{uploadErrors}</p>}
      <div className={styles.photoUploadActions}>
        <button type="button" className={styles.photoButton} onClick={open} disabled={photoItems.length >= 5}>
          Add photos
        </button>
      </div>
      <div className={styles.photoGrid}>
        {photoItems.map((photo) => (
          <div key={photo.id} className={styles.photoCard}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.src} alt={photo.name} className={styles.photoPreview} />
            <div className={styles.photoActions}>
              <button type="button" className={styles.photoActionButton} onClick={() => handlePhotoCrop(photo)}>
                Crop
              </button>
              <button type="button" className={styles.photoActionButton} onClick={() => removePhoto(photo.id)}>
                Remove
              </button>
            </div>
            <div className={styles.photoProgress}>
              <div className={styles.photoProgressFill} style={{ width: `${photo.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className={styles.inputNote}>
        Profiles with photos receive significantly more responses.
      </p>
    </div>
  );

  const renderPreferenceStep = () => (
    <div className={styles.fieldGrid}>
      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="preferredGender">
            Preferred Gender
          </label>
          <select id="preferredGender" className={styles.selectField} {...register("preferredGender")}> 
            {["Any", "Male", "Female", "Other"].map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="preferredAgeRange">
            Preferred Age Range (years)
          </label>
          <input id="preferredAgeRange" placeholder="e.g. 25-30" className={styles.inputField} {...register("preferredAgeRange")} />
        </div>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="preferredHeightRange">
            Preferred Height Range (ft)
          </label>
          <input id="preferredHeightRange" placeholder={`e.g. 5'4" - 5'8"`} className={styles.inputField} {...register("preferredHeightRange")} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="preferredLocation">
            Preferred Location
          </label>
          <input id="preferredLocation" className={styles.inputField} {...register("preferredLocation")} />
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className={styles.fieldGrid}>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel} htmlFor="password">
          Account Password
        </label>
        <input id="password" type="password" placeholder="Choose a password (min 6 chars)" className={styles.inputField} {...register("password")} />
      </div>
      <div className={styles.reviewCard}>
        <div className={styles.reviewCardHeader}>
          <span className={styles.reviewLabel}>Personal summary</span>
          <span className={styles.summaryTag}>Step 2</span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewLabel}>Full Name</span>
          <span className={styles.reviewValue}>{watchAll.fullName}</span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewLabel}>Profile Created For</span>
          <span className={styles.reviewValue}>{watchAll.createdFor}</span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewLabel}>Date of Birth</span>
          <span className={styles.reviewValue}>{watchAll.dateOfBirth}</span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewLabel}>Height</span>
          <span className={styles.reviewValue}>{watchAll.height}</span>
        </div>
      </div>

      <div className={styles.reviewCard}>
        <div className={styles.reviewCardHeader}>
          <span className={styles.reviewLabel}>Family details</span>
          <span className={styles.summaryTag}>Step 3</span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewLabel}>Father</span>
          <span className={styles.reviewValue}>{watchAll.fatherName} — {watchAll.fatherOccupation}</span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewLabel}>Mother</span>
          <span className={styles.reviewValue}>{watchAll.motherName} — {watchAll.motherOccupation}</span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewLabel}>Siblings</span>
          <span className={styles.reviewValue}>{watchAll.numberOfBrothers} brothers, {watchAll.numberOfSisters} sisters</span>
        </div>
      </div>

      <div className={styles.reviewCard}>
        <div className={styles.reviewCardHeader}>
          <span className={styles.reviewLabel}>Education & career</span>
          <span className={styles.summaryTag}>Step 4</span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewLabel}>Qualification</span>
          <span className={styles.reviewValue}>{watchAll.highestQualification}</span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewLabel}>Occupation</span>
          <span className={styles.reviewValue}>{watchAll.occupation}</span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewLabel}>Income</span>
          <span className={styles.reviewValue}>{watchAll.annualIncome || "Not specified"}</span>
        </div>
      </div>

      <div className={styles.reviewCard}>
        <div className={styles.reviewCardHeader}>
          <span className={styles.reviewLabel}>Residence</span>
          <span className={styles.summaryTag}>Step 5</span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewLabel}>Location</span>
          <span className={styles.reviewValue}>{watchAll.cityOrVillage}, {watchAll.state}, {watchAll.country}</span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewLabel}>Address</span>
          <span className={styles.reviewValue}>{watchAll.currentResidenceAddress}</span>
        </div>
      </div>

      <div className={styles.reviewCard}>
        <div className={styles.reviewCardHeader}>
          <span className={styles.reviewLabel}>Partner preferences</span>
          <span className={styles.summaryTag}>Step 7</span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewLabel}>Preferred Gender</span>
          <span className={styles.reviewValue}>{watchAll.preferredGender || "Any"}</span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewLabel}>Age & Height</span>
          <span className={styles.reviewValue}>{watchAll.preferredAgeRange || "Any"} / {watchAll.preferredHeightRange || "Any"}</span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewLabel}>Location</span>
          <span className={styles.reviewValue}>{watchAll.preferredLocation || "Any"}</span>
        </div>
      </div>

      <div className={styles.checkboxField}>
        <label className={styles.checkboxLabel} htmlFor="confirmAccurate">
          <input id="confirmAccurate" type="checkbox" className={styles.checkboxInput} {...register("confirmAccurate")} />
          <span className={styles.checkboxText}>I confirm that all information provided is accurate.</span>
        </label>
        <label className={styles.checkboxLabel} htmlFor="acceptPrivacy">
          <input id="acceptPrivacy" type="checkbox" className={styles.checkboxInput} {...register("acceptPrivacy")} />
          <span className={styles.checkboxText}>I agree to the Privacy Policy and Terms & Conditions.</span>
        </label>
        {confirmError && <p className={styles.fieldError}>{confirmError}</p>}
      </div>
    </div>
  );

  return (
    <main className={styles.pageShell}>
      <div className={styles.headerPanel}>
        <Link href="/" className={styles.backLink}>Back to Vardhman Matrimonials</Link>
        <div>
          <h1 className={styles.pageTitle}>
            {currentStep === -1 ? "Verify Your Mobile Number" : "Create Your Matrimonial Profile"}
          </h1>
          <p className={styles.pageSubtitle}>
            {currentStep === -1
              ? "Enter your mobile number to receive a verification code."
              : "Complete your profile to connect with suitable matches."}
          </p>
        </div>
      </div>

      <div className={styles.wizardShell}>
        {currentStep !== -1 && (
          <>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${formProgress}%` }} />
            </div>

            <div className={styles.stepLabels}>
              {stepLabels.map((label, index) => (
                <button type="button" key={label} className={`${styles.stepItem} ${index === currentStep ? styles.active : ""}`} onClick={() => goToStep(index)}>
                  <span>{`Step ${index + 1}`}</span>
                  {label}
                </button>
              ))}
            </div>
          </>
        )}

        <form className={styles.wizardCard} onSubmit={handleSubmit(onSubmit)}>
          {currentStep !== -1 && (
            <div className={styles.stepHeader}>
              <div>
                <p className={styles.stepDescription}>{`Step ${currentStep + 1} of ${stepLabels.length}`}</p>
                <h2 className={styles.stepTitle}>{stepLabels[currentStep]}</h2>
              </div>
            </div>
          )}

          {paymentError && <p className={styles.fieldError}>{paymentError}</p>}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.32 }}
            >
              {currentStep === -1 && renderMobileStep()}
              {currentStep === 0 && renderPersonalStep()}
              {currentStep === 1 && renderFamilyStep()}
              {currentStep === 2 && renderEducationStep()}
              {currentStep === 3 && renderResidenceStep()}
              {currentStep === 4 && renderPhotoStep()}
              {currentStep === 5 && renderPreferenceStep()}
              {currentStep === 6 && renderReviewStep()}
            </motion.div>
          </AnimatePresence>

          {currentStep === -1 ? (
            <div className={styles.buttonRow}>
              <div />
              <button
                type="button"
                className={styles.buttonPrimary}
                onClick={handleVerifyOtp}
                disabled={!otpSent || isLoadingOtp}
                style={{
                  opacity: !otpSent || isLoadingOtp ? 0.5 : 1,
                  cursor: !otpSent || isLoadingOtp ? "not-allowed" : "pointer",
                }}
              >
                {isLoadingOtp ? "Verifying..." : "Verify & Continue"}
              </button>
            </div>
          ) : (
            <div className={styles.buttonRow}>
              {currentStep > 0 ? (
                <button type="button" className={styles.buttonSecondary} onClick={previousStep}>
                  Back
                </button>
              ) : (
                <div />
              )}

              {currentStep < stepLabels.length - 1 ? (
                <button type="button" className={styles.buttonPrimary} onClick={nextStep}>
                  Continue
                </button>
              ) : (
                <button type="submit" className={styles.buttonPrimary} disabled={isSubmitting || isPaying}>
                  {isSubmitting || isPaying ? "Processing..." : "Submit Profile"}
                </button>
              )}
            </div>
          )}
        </form>
      </div>

      {cropModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Crop Photo</h3>
              <button type="button" className={styles.buttonTertiary} onClick={() => setCropModal(null)}>
                Close
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.cropPreview}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img ref={cropImageRef} src={cropModal.src} alt="Crop preview" />
              </div>
              <div className={styles.cropSlider}>
                <label className={styles.fieldLabel} htmlFor="cropZoom">Zoom</label>
                <input
                  id="cropZoom"
                  type="range"
                  min="1"
                  max="2"
                  step="0.01"
                  value={cropZoom}
                  onChange={(event) => setCropZoom(Number(event.target.value))}
                />
                <p className={styles.cropHelp}>Adjust the preview and click Apply Crop to update your image.</p>
              </div>
              <canvas ref={cropCanvasRef} style={{ display: "none" }} />
              <div className={styles.buttonRow}>
                <button type="button" className={styles.buttonSecondary} onClick={() => setCropModal(null)}>
                  Cancel
                </button>
                <button type="button" className={styles.buttonPrimary} onClick={applyCrop}>
                  Apply Crop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
