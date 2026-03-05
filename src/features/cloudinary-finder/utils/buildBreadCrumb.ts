export type BreadCrumbItem = {
  label: string;
  path: string;
};

export function buildBreadCrumb(path: string): BreadCrumbItem[] {
  const parts = path.split('/');
  
  const items: BreadCrumbItem[] = [];
  let acc = '';

  for (const part of parts) {
    acc = acc ? `${acc}/${part}` : part;

    items.push({
      label: part,
      path: acc
    });
  }

  return items;
}