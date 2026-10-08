import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div style={{ display: "grid", placeContent: "center", minHeight: "100vh" }}>
      <SignUp />
    </div>
  );
}
