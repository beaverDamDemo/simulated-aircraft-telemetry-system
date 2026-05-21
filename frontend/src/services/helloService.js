export async function fetchHello() {
  const response = await fetch('/hello');

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}
