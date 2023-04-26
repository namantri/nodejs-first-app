// everything in the Node is a module
const name = " Naman";
const name2 = "eHEllo";
const name3 = "jDHSa";
// module.exports = name;
export default name;
export { name2, name3 };
export const percent = () => {
  return `${~~(Math.random() * 100)}%`;
};
