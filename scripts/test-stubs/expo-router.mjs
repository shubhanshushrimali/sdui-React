export const router = {
  push() {},
  replace() {},
  back() {},
};

export function useRouter() {
  return router;
}

export function Link(props) {
  return props.children ?? null;
}
