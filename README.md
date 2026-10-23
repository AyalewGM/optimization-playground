# Optimization Playground

An independent **React + TypeScript** educational laboratory to see numerical optimization algorithms in action.

## Interactive experiments

Explore three landscapes: an anisotropic quadratic bowl, the Rosenbrock curved valley and the Himmelblau nonconvex landscape. Compare **gradient descent**, **momentum** and **damped Newton's method**. The canvas visualizes objective values as a heatmap and displays the iterate history as a yellow path. Click anywhere to choose an initial point, adjust step size, step manually or run continuously.

## Mathematical theory

Optimization seeks a point \(\mathbf{x}^*\) minimizing an objective \(f\), frequently subject to constraints:

$$
\min_{\mathbf{x}\in\mathbb{R}^n} f(\mathbf{x}).
$$

**Gradient descent** uses first derivatives:

$$
\mathbf{x}_{k+1}=\mathbf{x}_k-\alpha\nabla f(\mathbf{x}_k).
$$

**Momentum** adds history to help navigate shallow or elongated valleys:

$$
\mathbf{v}_{k+1}=\beta\mathbf{v}_k-\alpha\nabla f(\mathbf{x}_k),\qquad
\mathbf{x}_{k+1}=\mathbf{x}_k+\mathbf{v}_{k+1}.
$$

**Damped Newton's method** uses second derivatives to account for curvature:

$$
\mathbf{x}_{k+1}=\mathbf{x}_k-\alpha[\nabla^2 f(\mathbf{x}_k)]^{-1}\nabla f(\mathbf{x}_k).
$$

The educational implementation falls back to a gradient step when the Hessian is not positive definite or is too close to singular, and limits extreme update lengths. Thus it illustrates Newton-like behavior, not an unconditional guarantee of convergence.

### Example objectives

| Landscape | Formula | What it teaches |
| --- | --- | --- |
| Elliptic bowl | $f(x,y)=x^2+4y^2$ | Convexity, conditioning, oscillation |
| Rosenbrock valley | $f(x,y)=(1-x)^2+10(y-x^2)^2$ | Curved narrow valleys and learning-rate sensitivity |
| Himmelblau | $f(x,y)=(x^2+y-11)^2+(x+y^2-7)^2$ | Several distinct local minima; sensitivity to initialization |

### Why optimization still matters

Optimization is fundamental to **machine learning** (training models), **operations research** (routing, scheduling, resource allocation), **engineering** (design and control), **scientific computing** (inverse problems and parameter fitting) and **economics** (choice under constraints). Understanding the algorithms is also essential to recognizing failure modes: local minima, ill-conditioning, poor initialization, numerical errors and overaggressive step sizes.

### Guided investigations

1. Compare gradient descent and Newton's method on the convex quadratic with step size 1. Why is a full Newton step exact here?
2. Start at the default Rosenbrock point. Reduce the learning rate until updates stop overshooting the valley.
3. Choose different initial points for Himmelblau. Do they converge to the same solution?
4. Turn momentum on and look for acceleration or overshooting.
5. Change step size while keeping the starting point fixed. Which behavior changes?

## Run locally

Requires a recent Node.js 20+ or 22+ environment.

```bash
npm install
npm test
npm run dev
npm run build
```

A GitHub Actions workflow builds, tests and deploys to GitHub Pages after changes merge into `main`. Set **Settings → Pages → Source → GitHub Actions**. The Vite production base is `/optimization-playground/`.

## Limitations

- This version is an unconstrained two-variable playground, not a general optimization solver.
- Objective color scales are illustrative and depend on the selected landscape.
- The rendered iterations use finite-precision arithmetic. Step clipping is a teaching safeguard.
- There is no proof of global optimality for nonconvex landscapes.

## Further reading

- [Boyd and Vandenberghe — Convex Optimization](https://web.stanford.edu/~boyd/cvxbook/) (free official book)
- [NEOS Guide — Optimization](https://neos-guide.org/)
- [Nocedal and Wright — Numerical Optimization](https://link.springer.com/book/10.1007/978-0-387-40065-5)

Built as an independent visual mathematics project, following Game of Life and Mandelbrot Explorer.
