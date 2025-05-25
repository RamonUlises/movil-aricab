const editing = false;
const produccion = "https://api.aricab.shop";
const desarrollo = "http://192.168.1.29:3000";

const username = "aricab-1123-r-company".trim();
const password = "b24bc6442284142ce8d6e187961d37b0c7e7".trim();

const credetials = btoa(`${username}:${password}`)

export const server = {
  url: editing ? desarrollo : produccion,
  credetials
}