// Every backend endpoint wraps its payload in this envelope. Callers always
// see TWO nested .data properties when calling api.get/post: the outer one
// is Axios's own response wrapper (res.data), the inner one is this envelope's
// payload field (res.data.data). This double-unwrap is not a mistake or
// redundancy - do not "simplify" it to a single .data, or every API call
// in the app breaks silently (TypeScript won't catch it since both levels
// are typed as "any" until the generic is applied).
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}
