// frontend/src/setupTests.js
import "@testing-library/jest-dom";
import "whatwg-fetch";

beforeEach(() => {
    const currentTest = expect.getState().currentTestName;
    // Če nočeš, da preveč spam-a, lahko to vrstico tudi zakomentiraš
    console.log(`🔍 ZAČETEK TESTA: ${currentTest}`);
  });