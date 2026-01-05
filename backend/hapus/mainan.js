import { supabase } from "../src/config/database.js";

const { data, error } = await supabase.from("users").select("*");

console.log(data);
console.log(error);