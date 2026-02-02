const mockUser = {
  uid: "mock-admin",
  name: "Admin Master",
  email: "admin@assistec.io",
  companyId: "assistec-demo",
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  async signInWithEmail(email) {
    await delay(400);
    return { ...mockUser, email: email || mockUser.email };
  },
  async signInWithGoogle() {
    await delay(400);
    return mockUser;
  },
  async signOut() {
    await delay(200);
  },
};
