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

## Optimizer Race Arena (new)

Compare **Gradient Descent, Momentum, Nesterov, RMSProp, Adam, Newton, and BFGS** on the same objective, from the same starting point. Select competitors, step them synchronously, and inspect:

- Overlaid colored optimizer paths on the 2D landscape.
- A switchable **rotatable projected-3D wireframe** surface showing trajectories at their objective heights.
- Synchronized convergence curves plotting $\log(1+f(\mathbf{x}_k))$.
- A live comparison table with objective values, iteration counts and stop states.

The 3D view is a Canvas projection of a mathematical surface rather than a true WebGL renderer. Rotating its azimuth allows qualitative inspection of the terrain.

For Adam, running first and second moments are updated as

$$
\begin{aligned}
m_t&=\beta_1m_{t-1}+(1-\beta_1)g_t,\\
v_t&=\beta_2v_{t-1}+(1-\beta_2)g_t^2,\\
\hat m_t&=\frac{m_t}{1-\beta_1^t},\qquad\hat v_t=\frac{v_t}{1-\beta_2^t},\\
\mathbf{x}_{t+1}&=\mathbf{x}_t-\alpha\frac{\hat m_t}{\sqrt{\hat v_t}+\varepsilon}.
\end{aligned}
$$

BFGS maintains an approximation of the **inverse Hessian** with a curvature update whenever $s^Ty>0$. RMSProp uses an exponential average of squared gradients; Nesterov evaluates gradients at a momentum look-ahead point.

**Interpretation caution:** the shared slider value does not equate effective step sizes across methods. Educational step clipping bounds all displacements. Optimization results are not benchmark claims without repeated, calibrated experiments, independent stopping rules and comparable evaluation counts. This first release does not yet include exact line search, Wolfe conditions, or unconstrained trust-region safeguards.

### Interpreting optimizer race diagnostics

The race table now includes separate counts for **objective evaluations** and **gradient evaluations**, alongside gradient norm and how frequently the shared educational displacement limit was applied.

These distinctions matter: one iteration of BFGS or Nesterov may use more derivative evaluations than a simple gradient update. Counting iterations alone can therefore be misleading.

- **Objective evaluations:** calls to the objective during initialization and each accepted new step (not visualization sampling).
- **Gradient evaluations:** calls to the analytic gradient in the optimization runner, including look-ahead and post-step checks.
- **Gradient norm:** $\|\nabla f(\mathbf{x}_k)\|_2$, a first-order stationarity diagnostic, not proof of a global minimum.
- **Clipped steps:** number of updates that exceeded the educational maximum displacement of $1.25$ units.

**Caution:** This is still an instructional comparison, not a controlled benchmark. Learning-rate choices, clipping, and stopping criteria must be calibrated before comparing computational efficiency. The visual landscape renderer makes additional objective calls that are not included in algorithm counts.

## Interactive WebGL 3D terrain

The Optimizer Race Arena now includes a true Three.js/WebGL scene powered by React Three Fiber. Switch between **2D contour** and **Interactive WebGL 3D** to inspect the same optimization trajectories on a rotatable surface. Orbit controls support dragging to rotate, scrolling to zoom and right-dragging to pan.

The height uses the visual transform $h(x,y)=\min(7,1.35\log(1+\max(0,f(x,y))))$. This preserves objective ordering for the nonnegative benchmark functions while compressing large values; **the vertical axis is not a linear objective scale**. Original objective values and convergence diagnostics remain available in the 2D/leaderboard views.

The 3D view requires WebGL support. Canvas 2D contour mode remains available independently.

## Constrained Optimization Studio

Projected gradient descent solves convex constrained problems of the form

$$
\min_{\mathbf{x}\in C} f(\mathbf{x}), \quad
\mathbf{x}_{k+1}=\Pi_C\left(\mathbf{x}_k-\alpha\nabla f(\mathbf{x}_k)\right).
$$

Here $\Pi_C$ is the Euclidean projection onto a **feasible set** $C$. The application demonstrates three convex sets: a box $|x|,|y|\le1$, a unit disk $x^2+y^2\le1$, and the half-plane $x+y\le1$. Two quadratic objectives offer cases where the unconstrained minimizer lies outside the region.

The visualizer shows feasible points, the trajectory, the unconstrained minimizer, objective value and the projected-gradient residual

$$
R(\mathbf{x})=\left\|\mathbf{x}-\Pi_C\left(\mathbf{x}-\nabla f(\mathbf{x})\right)\right\|_2.
$$

For the disk, the interface also computes an illustrative KKT multiplier. With $g(x,y)=x^2+y^2-1\le0$, first-order KKT conditions are

$$
\nabla f(\mathbf{x})+\lambda\nabla g(\mathbf{x})=0,\quad
\lambda\ge0,\quad g(\mathbf{x})\le0,\quad \lambda g(\mathbf{x})=0.
$$

These conditions expose **active constraints**, stationarity and complementarity. The examples are smooth convex problems with convex feasible sets; this is not a general-purpose nonlinear programming solver. KKT diagnostics shown are specific to the disk, not claimed for all shapes.

Try starting outside the feasible region; the first state is projected inside. Then compare the box, disk and half-plane and observe how the optimal boundary point changes. The algorithm uses a fixed learning rate with no line search or automated convergence stopping.
