/** Analytic damped spring. Retargeting preserves the current presentation value and velocity. */
export function stepSpring(state, target, delta, response = .4, damping = 1) {
  const omega = 2 * Math.PI / response;
  const offset = state.value - target;
  const decay = Math.exp(-damping * omega * delta);
  if (damping >= 1) {
    const coefficient = state.velocity + omega * offset;
    return {
      value: target + (offset + coefficient * delta) * decay,
      velocity: (state.velocity - omega * coefficient * delta) * decay,
    };
  }
  const damped = omega * Math.sqrt(1 - damping * damping);
  const coefficient = (state.velocity + damping * omega * offset) / damped;
  const cosine = Math.cos(damped * delta), sine = Math.sin(damped * delta);
  const position = offset * cosine + coefficient * sine;
  return {
    value: target + decay * position,
    velocity: decay * (-offset * damped * sine + coefficient * damped * cosine - damping * omega * position),
  };
}
export function projectVelocity(velocity, deceleration = .99) {
  return (velocity / 1000) * deceleration / (1 - deceleration);
}
export function rubberband(distance, dimension, constant = .55) {
  return distance * dimension * constant / (dimension + constant * Math.abs(distance));
}
export const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
