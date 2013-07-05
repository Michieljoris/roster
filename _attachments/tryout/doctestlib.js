function factorial(n) {
  if (typeof n != "number") {
    throw "You must give a number";
      
  }
  if (n <= 0) {
    return 1;
  }
  return n * factorial(n-1);
}

