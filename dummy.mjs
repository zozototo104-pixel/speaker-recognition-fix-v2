export const db = {
  transaction: async (cb) => { await cb({ isMock: false }); }
};
