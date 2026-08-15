import type { BiodataTemplateId } from "./templates";

/// The server's view of a saved biodata-as-PrintOrder row - mirrors
/// biodata_order_summary() in api/views.py.
export type SavedBiodataOrderSummary = {
  id: number;
  template: string;
  label: string;
  data: Partial<BiodataData>;
  createdAt: string;
  forCustomer: boolean;
  paymentMode: string;
  paymentStatus: string;
  paymentGateway: string;
  gatewayOrderId: string;
  totalAmount: number;
  customerPhone: string;
};

export type BiodataData = {
  template: BiodataTemplateId;
  photo: string;
  fullName: string;
  dob: string;
  gender: string;
  maritalStatus: string;
  height: string;
  complexion: string;
  religion: string;
  caste: string;
  gotra: string;
  rashi: string;
  education: string;
  occupation: string;
  annualIncome: string;
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  siblings: string;
  nativePlace: string;
  currentAddress: string;
  permanentAddress: string;
  phone: string;
  email: string;
  hobbies: string;
};

export const STORAGE_KEY = "repetigo-biodata-maker-draft";

export const sampleBiodata: BiodataData = {
  template: "classic",
  photo: "",
  fullName: "Priya Sharma",
  dob: "12 Jun 1998",
  gender: "Female",
  maritalStatus: "Never Married",
  height: "5'4\"",
  complexion: "Fair",
  religion: "Hindu",
  caste: "Brahmin",
  gotra: "Kashyap",
  rashi: "Mithuna (Gemini)",
  education: "M.Com, Pune University",
  occupation: "Bank Officer, HDFC Bank",
  annualIncome: "6,00,000",
  fatherName: "Ramesh Sharma",
  fatherOccupation: "Retired Govt. Employee",
  motherName: "Sunita Sharma",
  motherOccupation: "Homemaker",
  siblings: "1 elder brother (married)",
  nativePlace: "Pune, Maharashtra",
  currentAddress: "Flat 302, Shree Residency, Kothrud, Pune - 411038",
  permanentAddress: "Flat 302, Shree Residency, Kothrud, Pune - 411038",
  phone: "+91 98765 43210",
  email: "priya.sharma@email.com",
  hobbies: "Classical music, reading, cooking",
};

export const blankBiodata: BiodataData = {
  template: "classic",
  photo: "",
  fullName: "",
  dob: "",
  gender: "",
  maritalStatus: "",
  height: "",
  complexion: "",
  religion: "",
  caste: "",
  gotra: "",
  rashi: "",
  education: "",
  occupation: "",
  annualIncome: "",
  fatherName: "",
  fatherOccupation: "",
  motherName: "",
  motherOccupation: "",
  siblings: "",
  nativePlace: "",
  currentAddress: "",
  permanentAddress: "",
  phone: "",
  email: "",
  hobbies: "",
};

export function biodataHasContent(data: BiodataData) {
  return !!(
    data.fullName.trim() ||
    data.education.trim() ||
    data.occupation.trim() ||
    data.fatherName.trim() ||
    data.currentAddress.trim()
  );
}
