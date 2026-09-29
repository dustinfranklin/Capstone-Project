import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import Home
  from "../pages/Home";

jest.mock(
  "react-router-dom",
  () => ({
    Link: ({
      children,
      to,
      ...props
    }) => (
      <a
        href={to}
        {...props}
      >
        {children}
      </a>
    ),
  })
);

describe("Home Page", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("loads and displays movies from the API", async () => {
    const mockMovies = [
      {
        _id: "movie1",
        title: "Inception",
        year: 2010,
        director:
          "Christopher Nolan",
        genre: [
          "Action",
          "Sci-Fi",
        ],
        poster:
          "https://example.com/inception.jpg",
        mpaRating: "PG-13",
        averageRating: 4.5,
        reviewCount: 2,
      },

      {
        _id: "movie2",
        title: "Pulp Fiction",
        year: 1994,
        director:
          "Quentin Tarantino",
        genre: [
          "Crime",
          "Drama",
        ],
        poster:
          "https://example.com/pulp-fiction.jpg",
        mpaRating: "R",
        averageRating: 4.8,
        reviewCount: 3,
      },
    ];

    global.fetch =
      jest.fn(() =>
        Promise.resolve({
          ok: true,

          json: () =>
            Promise.resolve(
              mockMovies
            ),
        })
      );

    render(
      <Home />
    );

    expect(
      screen.getByRole(
        "heading",
        {
          name: "Filmography",
          level: 1,
        }
      )
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        global.fetch
      ).toHaveBeenCalledWith(
        "http://localhost:4000/api/movies"
      );
    });

    expect(
  (
    await screen.findAllByText(
      "Inception"
    )
  ).length
).toBeGreaterThan(0);

    expect(
  screen.getAllByText(
    "Pulp Fiction"
  ).length
).toBeGreaterThan(0);
  });
});

test("filters movies by director", async () => {
  const mockMovies = [
    {
      _id: "movie1",
      title: "Inception",
      year: 2010,
      director:
        "Christopher Nolan",
      genre: [
        "Action",
        "Sci-Fi",
      ],
      poster:
        "https://example.com/inception.jpg",
      mpaRating: "PG-13",
      averageRating: 4.5,
      reviewCount: 2,
    },

    {
      _id: "movie2",
      title: "Pulp Fiction",
      year: 1994,
      director:
        "Quentin Tarantino",
      genre: [
        "Crime",
        "Drama",
      ],
      poster:
        "https://example.com/pulp-fiction.jpg",
      mpaRating: "R",
      averageRating: 4.8,
      reviewCount: 3,
    },
  ];

  global.fetch =
    jest.fn(() =>
      Promise.resolve({
        ok: true,

        json: () =>
          Promise.resolve(
            mockMovies
          ),
      })
    );

  render(
    <Home />
  );

  await waitFor(() => {
    expect(
      screen.getAllByText(
        "Inception"
      ).length
    ).toBeGreaterThan(0);
  });

  expect(
    screen.getAllByText(
      "Pulp Fiction"
    ).length
  ).toBeGreaterThan(0);

  const nolanButton =
    screen.getByRole(
      "button",
      {
        name:
          /Christopher Nolan 1 Film/i,
      }
    );

  expect(
    nolanButton
  ).toBeInTheDocument();

  fireEvent.click(
    nolanButton
  );

  expect(
    screen.getAllByText(
      "Inception"
    ).length
  ).toBeGreaterThan(0);

  expect(
    screen.queryByRole(
      "heading",
      {
        name: "Pulp Fiction",
        level: 5,
      }
    )
  ).not.toBeInTheDocument();
});