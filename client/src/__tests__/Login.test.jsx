import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import Login
  from "../pages/Login";

jest.mock(
  "react-router-dom",
  () => ({
    Link: ({
      children,
      to,
    }) => (
      <a href={to}>
        {children}
      </a>
    ),
  })
);

describe("Login Page", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
  });

  test("renders the login form", () => {
    render(
      <Login
        setCurrentUser={
          jest.fn()
        }
      />
    );

    expect(
      screen.getByRole(
        "heading",
        {
          name: "Login",
          level: 1,
        }
      )
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(
        "Email"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(
        "Password"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole(
        "button",
        {
          name: "Login",
        }
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole(
        "link",
        {
          name:
            "Create an account",
        }
      )
    ).toBeInTheDocument();
  });

  test("logs in a user successfully", async () => {
    const mockUser = {
      _id: "123",
      username: "testuser",
      email: "test@example.com",
    };

    const setCurrentUser =
      jest.fn();

    global.fetch =
      jest.fn(() =>
        Promise.resolve({
          ok: true,

          json: () =>
            Promise.resolve({
              message:
                "Login successful",
              user: mockUser,
            }),
        })
      );

    render(
      <Login
        setCurrentUser={
          setCurrentUser
        }
      />
    );

    fireEvent.change(
      screen.getByLabelText(
        "Email"
      ),
      {
        target: {
          value:
            "test@example.com",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText(
        "Password"
      ),
      {
        target: {
          value:
            "password123",
        },
      }
    );

    fireEvent.click(
      screen.getByRole(
        "button",
        {
          name: "Login",
        }
      )
    );

    await waitFor(() => {
      expect(
        global.fetch
      ).toHaveBeenCalledWith(
        "http://localhost:4000/api/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email:
              "test@example.com",
            password:
              "password123",
          }),
        }
      );
    });

    await waitFor(() => {
      expect(
        setCurrentUser
      ).toHaveBeenCalledWith(
        mockUser
      );
    });

    expect(
      JSON.parse(
        localStorage.getItem(
          "currentUser"
        )
      )
    ).toEqual(
      mockUser
    );

    expect(
      screen.getByText(
        "Login successful"
      )
    ).toBeInTheDocument();
  });
});