const sendMessageToWhatsappURL = (phone: string) => {
  return `https://api.whatsapp.com/send?phone=${phone}&text=Hello%20there,%20I%20hope%20you're%20doing%20well!`;
};

export { sendMessageToWhatsappURL };
