// Stop the owned test server without relying on Windows process-tree permissions.
export default async function teardown() {
  await fetch("http://127.0.0.1:4173/__shutdown").catch(() => {});
}
