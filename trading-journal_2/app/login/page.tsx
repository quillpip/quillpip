"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);
const router = useRouter();
const searchParams = useSearchParams();

async function handleSubmit(e: React.FormEvent) {
e.preventDefault();
setError(null);
setLoading(true);

const supabase = createClient();
const { error } = await supabase.auth.signInWithPassword({
email,
password,
});

setLoading(false);

if (error) {
setError(error.message);
return;
}

const next = searchParams.get("next") || "/journal";
router.push(next);
router.refresh();
}
