module.exports = class Spline {
  constructor(xs, ys) {
    this.xs = xs;
    this.ys = ys;
    this.ks = this.getNaturalKs(new Array(this.xs.length).fill(0));
  }

  getNaturalKs(ks) {
    const n = this.xs.length - 1;
    const A = zerosMat(n + 1, n + 2);

    for (
      let i = 1;
      i < n;
      i++ // rows
    ) {
      A[i][i - 1] = 1 / (this.xs[i] - this.xs[i - 1]);
      A[i][i] =
        2 *
        (1 / (this.xs[i] - this.xs[i - 1]) + 1 / (this.xs[i + 1] - this.xs[i]));
      A[i][i + 1] = 1 / (this.xs[i + 1] - this.xs[i]);
      A[i][n + 1] =
        3 *
        ((this.ys[i] - this.ys[i - 1]) /
          ((this.xs[i] - this.xs[i - 1]) * (this.xs[i] - this.xs[i - 1])) +
          (this.ys[i + 1] - this.ys[i]) /
            ((this.xs[i + 1] - this.xs[i]) * (this.xs[i + 1] - this.xs[i])));
    }

    A[0][0] = 2 / (this.xs[1] - this.xs[0]);
    A[0][1] = 1 / (this.xs[1] - this.xs[0]);
    A[0][n + 1] =
      (3 * (this.ys[1] - this.ys[0])) /
      ((this.xs[1] - this.xs[0]) * (this.xs[1] - this.xs[0]));

    A[n][n - 1] = 1 / (this.xs[n] - this.xs[n - 1]);
    A[n][n] = 2 / (this.xs[n] - this.xs[n - 1]);
    A[n][n + 1] =
      (3 * (this.ys[n] - this.ys[n - 1])) /
      ((this.xs[n] - this.xs[n - 1]) * (this.xs[n] - this.xs[n - 1]));

    return solve(A, ks);
  }

  /**
   * inspired by https://stackoverflow.com/a/40850313/4417327
   */
  getIndexBefore(target) {
    let low = 0;
    let high = this.xs.length;
    let mid = 0;
    while (low < high) {
      mid = Math.floor((low + high) / 2);
      if (this.xs[mid] < target && mid !== low) {
        low = mid;
      } else if (this.xs[mid] > target && mid !== high) {
        high = mid;
      } else {
        high = low;
      }
    }
    return low + 1;
  }

  at(x) {
    let i = this.getIndexBefore(x);
    const t = (x - this.xs[i - 1]) / (this.xs[i] - this.xs[i - 1]);
    const a =
      this.ks[i - 1] * (this.xs[i] - this.xs[i - 1]) -
      (this.ys[i] - this.ys[i - 1]);
    const b =
      -this.ks[i] * (this.xs[i] - this.xs[i - 1]) +
      (this.ys[i] - this.ys[i - 1]);
    const q =
      (1 - t) * this.ys[i - 1] +
      t * this.ys[i] +
      t * (1 - t) * (a * (1 - t) + b * t);
    return q;
  }
};

function solve(A, ks) {
  let m = A.length;
  for (
    let k = 0;
    k < m;
    k++ // column
  ) {
    // pivot for column
    let i_max = 0;
    let vali = Number.NEGATIVE_INFINITY;
    for (let i = k; i < m; i++)
      if (A[i][k] > vali) {
        i_max = i;
        vali = A[i][k];
      }
    swapRows(A, k, i_max);

    // for all rows below pivot
    for (let i = k + 1; i < m; i++) {
      for (let j = k + 1; j < m + 1; j++) {
        if (A[k][k]) {
          A[i][j] = A[i][j] - A[k][j] * (A[i][k] / A[k][k]);
        }
      }
      A[i][k] = 0;
    }
  }
  for (
    let i = m - 1;
    i >= 0;
    i-- // rows = columns
  ) {
    var v=0;
    if(A[i][i]) {
      v = A[i][m] / A[i][i];
    }
    ks[i] = v;
    for (
      let j = i - 1;
      j >= 0;
      j-- // rows
    ) {
      A[j][m] -= A[j][i] * v;
      A[j][i] = 0;
    }
  }
  return ks;
}

function zerosMat(r, c) {
  const A = [];
  for (let i = 0; i < r; i++) {
    A.push([]);
    for (let j = 0; j < c; j++) A[i].push(0);
  }
  return A;
}

function swapRows(m, k, l) {
  let p = m[k];
  m[k] = m[l];
  m[l] = p;
}
