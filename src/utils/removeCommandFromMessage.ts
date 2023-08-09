export const removeCommandFromMessage = (message: string) => {
  if (!message.startsWith("!")) return message;

  const splitMessage = message.split(" "); // ["!marker", "something", "here"]

  // remove command
  splitMessage.shift();

  return splitMessage.join(" ");
};
