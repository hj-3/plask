// 간단한 toast helper (필요 시 UI 컴포넌트로 확장 가능)
export const toast = {
  info: (message) => {
    // TODO: UI 기반 toast로 확장 가능
    window.alert(message);
  },
  success: (message) => {
    window.alert(message);
  },
  error: (message) => {
    window.alert(message);
  },
};
