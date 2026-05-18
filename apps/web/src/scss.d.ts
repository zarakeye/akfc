declare module "*.scss" {
  const classes: { readonly [className: string]: string }
  export default classes
}

declare module "*.sass" {
  const classes: { readonly [className: string]: string }
  export default classes
}

declare module "*.css" {
  const classes: { readonly [className: string]: string }
  export default classes
}
