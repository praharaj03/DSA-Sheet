import { lazy, Suspense, type ComponentType } from "react";

export default function dynamic<T extends object>(
  load: () => Promise<{ default: ComponentType<T> }>,
  options: { loading: ComponentType },
) {
  const Component = lazy(load);
  const Loading = options.loading;
  return function DynamicComponent(props: T) {
    return (
      <Suspense fallback={<Loading />}>
        <Component {...props} />
      </Suspense>
    );
  };
}
