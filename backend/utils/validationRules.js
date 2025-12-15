module.exports = {
  signup: {
    fullName: "REQUIRED | LENGTH 2 50",
    username: "REQUIRED | LENGTH 3 30",
    email: "REQUIRED | EMAIL",
    password: "REQUIRED | PASSWORD",
    phone: "REQUIRED | PHONE",
    location: "REQUIRED | LENGTH 2 50",
    age: "RANGE 13 120"
  },

  login: {
    username: "REQUIRED | LENGTH 3 30",
    password: "REQUIRED"
  },

  contact: {
    name: "REQUIRED | LENGTH 2 50",
    email: "REQUIRED | EMAIL",
    message: "REQUIRED | LENGTH 10 1000"
  }
};
