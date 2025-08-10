import { defineQuery } from "groq";

export const contentQuery = defineQuery(`*[_type == "post"]`);
