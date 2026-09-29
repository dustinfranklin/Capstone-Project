import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import Register
  from "../pages/Register";

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

describe("Register Page", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders the registration form", () => {
    render(
      <Register />
    );

    expect(
      screen.getByRole(
        "heading",
        {
          name: "Register",
          level: 1,
        }
      )
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(
        "First Name"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(
        "Last Name"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(
        "Username"
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
          name: "Create Account",
        }
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole(
        "link",
        {
          name: "Log in",
        }
      )
    ).toBeInTheDocument();
  });

  test("registers a new user successfully", async () => {
    global.fetch =
      jest.fn(() =>
        Promise.resolve({
          ok: true,

          json: () =>
            Promise.resolve({
              message:
                "Registration successful",
            }),
        })
      );

    render(
      <Register />
    );

    fireEvent.change(
      screen.getByLabelText(
        "First Name"
      ),
      {
        target: {
          value: "John",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText(
        "Last Name"
      ),
      {
        target: {
          value: "Doe",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText(
        "Username"
      ),
      {
        target: {
          value: "johndoe",
        },
      }
    );

    fireEvent.change(
      screen.getByLabelText(
        "Email"
      ),
      {
        target: {
          value:
            "john@example.com",
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
          name:
            "Create Account",
        }
      )
    );

    await waitFor(() => {
      expect(
        global.fetch
      ).toHaveBeenCalledWith(
        "http://localhost:4000/api/register",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            firstName: "John",
            lastName: "Doe",
            username: "johndoe",
            email:
              "john@example.com",
            password:
              "password123",
          }),
        }
      );
    });

    expect(
      await screen.findByText(
        "Registration successful"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(
        "First Name"
      )
    ).toHaveValue("");

    expect(
      screen.getByLabelText(
        "Last Name"
      )
    ).toHaveValue("");

    expect(
      screen.getByLabelText(
        "Username"
      )
    ).toHaveValue("");

    expect(
      screen.getByLabelText(
        "Email"
      )
    ).toHaveValue("");

    expect(
      screen.getByLabelText(
        "Password"
      )
    ).toHaveValue("");
  });
});