import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import AdminNav from "../../components/AdminNav";
import { db } from "../../firebase/config";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => onSnapshot(collection(db, "users"), (snapshot) => setUsers(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))), []);

  async function toggleRole(user) {
    const role = user.role === "admin" ? "user" : "admin";
    await updateDoc(doc(db, "users", user.uid || user.id), { role });
    toast.success(`Role changed to ${role}`);
  }

  return (
    <div className="container-page py-10">
      <AdminNav />
      <h1 className="text-4xl font-black">Users</h1>
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 dark:bg-white/5"><tr><th className="p-4">User</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Joined</th><th className="p-4">Action</th></tr></thead>
          <tbody>{users.map((user) => <tr key={user.uid || user.id} className="border-t"><td className="p-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">{user.photoURL ? <img src={user.photoURL} alt="" className="h-full w-full object-cover" /> : user.name?.[0] || "U"}</div><b>{user.name}</b></div></td><td className="p-4">{user.email}</td><td className="p-4"><span className="badge bg-primary/10 text-primary">{user.role}</span></td><td className="p-4">{user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : "-"}</td><td className="p-4"><button className="btn-secondary py-2" onClick={() => toggleRole(user)}>Make {user.role === "admin" ? "user" : "admin"}</button></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
