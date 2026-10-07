export type GradeLetter = 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'D' | 'E' | '-';

export interface Course {
  id: string;
  code: string;
  name: string;
  sks: number;
  semester: number;
  status: 'SELESAI' | 'SEDANG_DITEMPUH' | 'BELUM_DIAMBIL';
  grade?: GradeLetter;
  targetGrade?: GradeLetter;
  category: 'Wajib' | 'Pilihan' | 'Praktikum' | 'Tugas Akhir';
  description: string;
  competencies: string[];
  prerequisites?: string[];
}

export interface SemesterData {
  semesterNumber: number;
  title: string;
  targetDescription: string;
  milestone: string;
  isCurrent: boolean;
  courses: Course[];
}

export interface TaskItem {
  id: string;
  title: string;
  courseCode?: string;
  deadline: string; // ISO date string
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'Tugas' | 'Kuis' | 'Proyek' | 'Skripsi' | 'UMKM' | 'Praktikum';
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export interface CareerPath {
  id: string;
  title: string;
  roleIndo: string;
  icon: string;
  salaryRange: string;
  difficulty: 'MEDIUM' | 'HARD' | 'EXPERT';
  description: string;
  coreSkills: { name: string; category: string }[];
  certifications: string[];
  recommendedElectives: string[];
  thesisTopics: string[];
}

export interface UMKMProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  minStockAlert: number;
  unit: string;
}

export interface UMKMSale {
  id: string;
  invoiceNo: string;
  date: string;
  customerName: string;
  items: {
    productId: string;
    productName: string;
    qty: number;
    price: number;
  }[];
  totalAmount: number;
  paymentMethod: 'QRIS' | 'MIDTRANS' | 'VIRTUAL_ACCOUNT' | 'TUNAI' | 'CYBER_PAY';
  paymentStatus: 'LUNAS' | 'PENDING' | 'BATAL';
}
