import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const mapDoc = (d) => ({ id: d.id, ...d.data() });

export async function getAllProducts() {
  const snap = await getDocs(collection(db, "products"));
  return snap.docs.map(mapDoc);
}

export async function getFeaturedProducts() {
  const q = query(collection(db, "products"), where("featured", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map(mapDoc);
}

export async function getProductById(id) {
  const snap = await getDoc(doc(db, "products", id));
  return snap.exists() ? mapDoc(snap) : null;
}