
export type TransactionType = 'IN' | 'OUT';
export type UserRole = 'INPUTTER' | 'MAKER_APPROVER' | 'CHECKER';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string; // Digunakan untuk Nama Merek
  serialNumber: string; // Kolom baru
  category: string;
  quantity: number;
  unit: string;
  minThreshold: number; // Masih ada di tipe data tapi akan difungsikan sebagai recordDate di UI jika perlu, namun lebih baik tambah field baru
  recordDate: string; // Kolom baru untuk Pemilihan Tanggal
  price: number;
  lastUpdated: string;
  imageUrl?: string;
  status: 'APPROVED' | 'PENDING';
  createdBy: string;
}

export interface Transaction {
  id: string;
  itemId: string;
  itemName: string;
  type: TransactionType;
  quantity: number;
  date: string;
  notes?: string;
  user: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}
