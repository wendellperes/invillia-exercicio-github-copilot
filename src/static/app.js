document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  const darkModeToggle = document.getElementById("dark-mode-toggle");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Create toggle button for details
        const toggleButton = document.createElement("button");
        toggleButton.textContent = "View Details";
        toggleButton.className = "toggle-details";
        toggleButton.addEventListener("click", () => {
          detailsDiv.classList.toggle("hidden");
          toggleButton.textContent = detailsDiv.classList.contains("hidden")
            ? "View Details"
            : "Hide Details";
        });

        // Add details section
        const detailsDiv = document.createElement("div");
        detailsDiv.className = "details hidden";
        detailsDiv.innerHTML = `
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${
            details.participants.length > 0
              ? `<p><strong>Participants:</strong> ${details.participants.join(", ")}</p>`
              : `<p><strong>Participants:</strong> No participants yet</p>`
          }
        `;

        activityCard.innerHTML = `<h4>${name}</h4>`;
        activityCard.appendChild(toggleButton);
        activityCard.appendChild(detailsDiv);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;
    // Email validation using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      messageDiv.textContent = "Please enter a valid email address.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);

      return; // Stop form submission if email is invalid
    }

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); 
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Toggle dark mode
  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    document.querySelector("header").classList.toggle("dark-mode");
    document.querySelectorAll("section").forEach((section) => {
      section.classList.toggle("dark-mode");
    });

    // Toggle dark mode for activity cards
    document.querySelectorAll(".activity-card").forEach((card) => {
      card.classList.toggle("dark-mode");
    });

    // Toggle dark mode class for the button
    darkModeToggle.classList.toggle("dark-mode");
  });

  // Initialize app
  fetchActivities();
});
