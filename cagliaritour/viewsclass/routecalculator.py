
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from cagliaritour.models import Place, QValue
from datetime import datetime, timedelta
import numpy as np
import random
from scipy.spatial import distance
from django.db.models import Max
import json
from math import radians, sin, cos, sqrt, atan2
from scipy.spatial.distance import cdist
from math import radians, sin, cos, sqrt, atan2







# Q-learning parameters
alpha = 0.1  # Learning rate
gamma = 0.9  # Discount factor
initial_epsilon = 0.1  # Initial exploration rate
epsilon_decay = 0.99  # Decay rate for epsilon
decay_lambda = 0.5  # Decay parameter for state update

categories = [
    "Beaches",
    "Churches and Places of Worship",
    "Historical Sites and Monuments",
    "Markets and Shopping Streets",
    "Markets and Shopping Streets ",
    "Museums and Art Galleries",
    "Parks and Gardens",
    "Parks and Gardens ",
    "Scenic Spots",
    "Scenic spot"
]

num_categories = len(categories)

# Genetic Algorithm Parameters
population_size = 6
generations = 30
mutation_rate = 0.05

# Meal break time settings
meal_break_time = ("12:30", "14:30")


# Helper function to get state representation
def get_state(age, nationality, interests):
    return (age, nationality, tuple(interests))


def update_state(previous_state, new_distribution, decay=0.5):
    updated_interests = [(decay * p + (1 - decay) * n) for p, n in zip(previous_state[2], new_distribution)]
    return (previous_state[0], previous_state[1], tuple(updated_interests))


# Reward function based on Jensen-Shannon distance
def jensen_shannon_distance(p, q):
    p, q = np.array(p), np.array(q)
    m = (p + q) / 2
    return 1 - (distance.jensenshannon(p, q) ** 2)


def calculate_reward(state_distribution, feedback_distribution):
    return jensen_shannon_distance(state_distribution, feedback_distribution)

# ε-greedy policy to choose an action based on current state
def choose_action(state, epsilon):
    age, nationality, interests = state
    state_actions = QValue.objects.filter(age=age, nationality=nationality, interests=interests)

    if random.uniform(0, 1) < epsilon or not state_actions.exists():
        action = np.random.dirichlet(np.ones(num_categories)).tolist()
    else:
        best_qvalue = state_actions.order_by('-q_value').first()
        action = best_qvalue.action

    QValue.objects.get_or_create(age=age, nationality=nationality, interests=interests, action=action,
                                 defaults={'q_value': 0})
    return action


# Q-learning update rule
def q_learning_update(state, action, reward, next_state):
    age, nationality, interests = state
    interests, action = list(interests), list(action)

    q_entry, _ = QValue.objects.get_or_create(
        age=age, nationality=nationality, interests=interests, action=action, defaults={'q_value': 0}
    )

    next_state_actions = QValue.objects.filter(age=next_state[0], nationality=next_state[1], interests=next_state[2])
    max_future_q = next_state_actions.aggregate(max_q=Max('q_value'))['max_q'] or 0

    current_q = q_entry.q_value
    new_q = current_q + alpha * (reward + gamma * max_future_q - current_q)

    q_entry.q_value = new_q
    q_entry.save()


# Haversine distance function
distance_cache = {}





def haversine_distance(loc1, loc2, public_transport_percentage=0, taxi=False):
    """
    Calculate the distance between two locations considering transportation modes.

    :param loc1: Tuple of (latitude, longitude) for the first location.
    :param loc2: Tuple of (latitude, longitude) for the second location.
    :param public_transport_percentage: A float between 0 and 1, where 0 means no public transport and 1 means full public transport.
    :param taxi: Boolean, True if taxi is selected, False otherwise.
    :return: Distance in kilometers, adjusted for transportation mode.
    """
    # Check if distance is already in cache
    if (loc1, loc2) in distance_cache:
        return distance_cache[(loc1, loc2)]

    # Radius of the Earth in kilometers
    R = 6371.0

    # Convert latitude and longitude from degrees to radians
    lat1, lon1 = radians(loc1[0]), radians(loc1[1])
    lat2, lon2 = radians(loc2[0]), radians(loc2[1])

    # Differences in coordinates
    dlat = lat2 - lat1
    dlon = lon2 - lon1

    # Haversine formula
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    # Base distance in kilometers (straight-line)
    distance = R * c

    # Adjust based on transportation mode
    if taxi:
        # Taxi: More direct route (slightly adjusted)
        distance *= 1.05  # slight increase due to traffic or road conditions
    else:
        # Walking and Public Transport mix
        walking_percentage = 1 - public_transport_percentage

        # Adjust distance for walking (walking is slower and paths are less direct)
        walking_distance = distance * walking_percentage * 1.2  # Increase by 20% for walking
        # Adjust distance for public transport (public transport can be less direct)
        public_transport_distance = distance * public_transport_percentage * 1.1  # Increase by 10% for public transport

        # Total adjusted distance is the combination of both
        distance = walking_distance + public_transport_distance

    # Store the result in the cache
    distance_cache[(loc1, loc2)] = distance

    return distance


# Time parsing function
def parse_time(time_str):
    if not time_str.strip():
        return None
    if not any(period in time_str for period in ("AM", "PM")):
        hour = int(time_str.split(":")[0])
        time_str += "AM" if hour < 12 else "PM"
    try:
        time_obj = datetime.strptime(time_str.strip(), "%I:%M%p" if ':' in time_str else "%I%p")
        return time_obj.hour + time_obj.minute / 60.0
    except ValueError:
        return None


# Check if a place is open


def get_average_age_group(age):
    # Define the average age based on the range
    if 18 <= age <= 24:
        return 21  # Average of 18–24
    elif 25 <= age <= 34:
        return 29  # Average of 25–34
    elif 35 <= age <= 44:
        return 39  # Average of 35–44
    elif 45 <= age <= 54:
        return 49  # Average of 45–54
    elif 55 <= age <= 64:
        return 59  # Average of 55–64
    elif age >= 65:
        return 65  # Average for 65+ years
    else:
        return 10  # Age below 18
import random
import json
from datetime import datetime, timedelta
from django.http import JsonResponse
import logging

# Setup logging
logger = logging.getLogger(__name__)

def calculate_route(request, numberofdays):
    try:
        # Retrieve epsilon with decay based on iterations in session
        iterations = request.session.get("iterations", 1)
        epsilon = max(0.01, initial_epsilon * (epsilon_decay**iterations))

        # Retrieve user profile details
        get_age = request.GET.get("age")  # Get age from request

        # Check if get_age is empty or None
        if get_age:
            age = get_average_age_group(int(get_age))  # Process the age if it's valid
        else:
            age = 29  # Use a default value if age is empty

        # Check if nationality (race) is provided, otherwise set a default
        nationality = request.GET.get("race") or "DefaultRace"  # Replace "DefaultRace" with your default race

        num_days = int(numberofdays)

        public_transport = float(request.GET.get("public_transport", 0))  # Default to 0 if not provided
        taxi = request.GET.get("taxi", "false").lower() == "true"  # Default to False if not provided

        # Initialize state and Q-learning action
        initial_interests = [1 / num_categories] * num_categories
        state = get_state(age, nationality, initial_interests)
        action = choose_action(state, epsilon)
        population_size = 30
        # Fetch all accessible places
        all_places = list(Place.objects.all())
        time_slots = [
            ("08:30", "09:00"),
            ("09:15", "10:30"),
            ("10:45", "11:15"),
            ("15:00", "15:30"),
            ("15:45", "17:00"),
            ("17:15", "17:45"),
        ]

        # Genetic Algorithm Initialization
        if len(all_places) < population_size:
            logger.warning("Population size exceeds available places. Adjusting population size.")
            population_size = len(all_places)

        population = [
            random.sample(all_places, min(len(all_places), len(all_places)))
            for _ in range(population_size)
        ]

        # Generate unique itineraries for each day
        main_itinerary = []
        unvisited_places = set(all_places)  # Keep track of unvisited places

        for day in range(num_days):
            if not unvisited_places:
                break  # Stop if there are no more unvisited places

            # Create a filtered population to ensure no repeated places for this day
            population = [
                [place for place in route if place in unvisited_places]
                for route in population
            ]

            # Remove empty routes
            population = [route for route in population if len(route) > 0]
            if len(population) == 0:
                logger.error(f"No valid routes available for day {day}.")
                return JsonResponse({"error": f"No valid routes available for day {day}."}, status=400)

            # Run GA for this day's itinerary
            for gen in range(generations):
                if len(population) < 2:
                    logger.error("Insufficient population for crossover.")
                    return JsonResponse({"error": "Insufficient population for crossover."}, status=400)

                new_population = []
                for _ in range(population_size // 2):
                    parent1, parent2 = random.sample(population, 2)
                    child1 = parent1[: len(parent1) // 2] + parent2[len(parent2) // 2 :]
                    child2 = parent2[: len(parent2) // 2] + parent1[len(parent1) // 2 :]
                    if random.random() < mutation_rate and len(child1) > 1:
                        i, j = random.sample(range(len(child1)), 2)
                        child1[i], child1[j] = child1[j], child1[i]
                    new_population.extend([child1, child2])
                population = sorted(
                    new_population,
                    key=lambda x: fitness(x, action, public_transport, taxi, time_slots),
                    reverse=True,
                )[:population_size]

            # Select the best route for this day
            best_route = population[0][: len(time_slots)]  # Limit places to time slots

            # Update unvisited places
            unvisited_places.difference_update(best_route)

            # Format this day's itinerary
            day_itinerary = {
                "day": (datetime.today() + timedelta(days=day)).strftime("%d/%m/%Y"),
                "POIs": [place.Name for place in best_route],
                "visitTime": [
                    f"{start}-{end}" for start, end in time_slots[: len(best_route)]
                ],
            }
            main_itinerary.append(day_itinerary)

        # Store state, action, and iterations in session
        request.session["current_state"] = state
        request.session["current_action"] = action
        request.session["iterations"] = iterations + 1  # Increment the iteration count

        # Return the generated itinerary
        return JsonResponse({"guide": main_itinerary})

    except Exception as e:
        logger.exception("An unexpected error occurred.")
        return JsonResponse({"error": f"An error occurred: {str(e)}"}, status=500)
from datetime import datetime, timedelta
import random
from django.http import JsonResponse
from datetime import datetime, timedelta
import random
from django.http import JsonResponse

def is_open(place, allocated_time):
    """Checks if a place is open during the allocated visit time."""
    day = allocated_time.strftime("%A")
    hour = allocated_time.hour + allocated_time.minute / 60.0
    opening_hours_raw = place.OpeningTime.strip('"').replace("'", '"')
    opening_hours = json.loads(opening_hours_raw)
    if all(value == "-" for value in opening_hours.values()):
        return True
    if day not in opening_hours:
        return False
    hours_today = opening_hours[day]
    if "Open 24 hours" in hours_today:
        return True
    if hours_today.lower() == "closed":
        return False
    time_ranges = [tr.strip() for tr in hours_today.replace(",", " ").split() if tr]
    for time_range in time_ranges:
        if "-" in time_range:
            start, end = time_range.split("-")
            start_hour, end_hour = parse_time(start), parse_time(end)
            if start_hour is not None and end_hour is not None and start_hour <= hour <= end_hour:
                return True
    return False


def fitness(route, profile, public_transport, taxi, time_slots):
    # Filter out closed places
    open_route = [
        place for place, time_slot in zip(route, time_slots[: len(route)])
        if is_open(place, datetime.strptime(time_slot[0], "%H:%M"))
    ]

    # If no places are open, return a very low score
    if not open_route:
        return -float('inf')

    # Calculate score based only on open places
    score = sum(p.average_rating for p in open_route if p.average_rating is not None)

    # Calculate total distance for open places only
    total_distance = sum(
        haversine_distance(
            (
                float(open_route[i].Location.split(",")[0]),
                float(open_route[i].Location.split(",")[1]),
            ),
            (
                float(open_route[i + 1].Location.split(",")[0]),
                float(open_route[i + 1].Location.split(",")[1]),
            ),
            public_transport,
            taxi,
        )
        for i in range(len(open_route) - 1)
    )
    penalty_distance = 0.3 * total_distance  # Adjusted distance penalty

    # Calculate the penalty for closed places
    penalty_closed = len(route) - len(open_route)  # The number of closed places

    # Category penalty
    category_penalty = sum(
        abs(
            (len([p for p in open_route if p.Category == category]) / len(open_route))
            - profile[i]
        )
        for i, category in enumerate(categories)
    )

    # Return the fitness score, considering penalties for distance, closed places, and categories
    return score - penalty_distance - 0.5 * penalty_closed - 0.3 * category_penalty


def calculate_feedback_distribution(feedback_pois):
    """
    Calculate the distribution of categories based on feedback POIs.
    This returns a list with the normalized distribution across the predefined categories.
    """
    category_count = {category: 0 for category in categories}  # Start with zero for each category

    # Count each POI's category in the feedback data
    for poi_name in feedback_pois:
        place = Place.objects.filter(Name=poi_name).first()
        if place:
            category_count[place.Category] += 1

    # Normalize the counts to form a distribution
    total_pois = sum(category_count.values())
    if total_pois == 0:
        return [1 / len(categories)] * len(categories)  # Default to equal distribution if no POIs

    return [category_count[category] / total_pois for category in categories]


@csrf_exempt
@require_POST
def feedback_route(request):
    """
    Endpoint to process user feedback on the itinerary.
    Iterates over each day in the guide, calculates the reward, and updates the Q-learning state.
    """
    # Retrieve session-stored original state and action
    session_state = request.session.get('current_state')
    session_action = request.session.get('current_action')
    if not session_state or not session_action:
        return JsonResponse({"error": "No itinerary found in session."}, status=400)

    try:
        # Parse the feedback JSON from the request body
        feedback_data = json.loads(request.body)
        guide_data = feedback_data.get("guide", [])

        # Validate the input structure
        if not guide_data or not isinstance(guide_data, list):
            return JsonResponse({"error": "Invalid feedback guide structure."}, status=400)

        # Process feedback for each day
        total_reward = 0
        detailed_rewards = []  # Collect rewards for debugging or reporting

        for day_entry in guide_data:
            day = day_entry.get("day")
            feedback_pois = day_entry.get("POIs", [])
            feedback_visit_times = day_entry.get("visitTime", [])

            if not feedback_pois:
                continue  # Skip if no POIs are provided for the day

            # Construct feedback distribution based on the categories of feedback POIs
            feedback_distribution = calculate_feedback_distribution(feedback_pois)

            # Calculate the reward for this day's feedback
            reward = calculate_reward(session_action, feedback_distribution)
            total_reward += reward  # Accumulate the total reward across all days

            # Update the Q-learning state for this day
            updated_state = update_state(session_state, feedback_distribution, decay=0.5)

            # Save the Q-value for this day's feedback
            age, nationality, interests = session_state
            QValue.objects.update_or_create(
                age=age,
                nationality=nationality,
                interests=interests,
                action=session_action,
                defaults={"q_value": reward}
            )

            # Update the session state for the next iteration
            session_state = updated_state  # Carry over state updates to the next day

            # Log detailed rewards per day for debugging or analytics
            detailed_rewards.append({"day": day, "reward": reward})

        # Update the session with the final state after processing all days
        request.session['current_state'] = session_state

        return JsonResponse({
            "message": "Feedback received",
            "total_reward": total_reward,
            "detailed_rewards": detailed_rewards
        })

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data."}, status=400)

    except Exception as e:
        return JsonResponse({"error": f"Unexpected error occurred: {str(e)}"}, status=500)


def print_unique_categories(request):
    """
    Retrieves and prints all unique categories from the Place model in the database.
    """
    try:
        # Get all unique categories
        unique_categories = Place.objects.values_list('Category', flat=True).distinct()

        # Convert to a sorted list for better readability
        unique_categories_list = sorted(set(unique_categories))

        # Print the unique categories to the console
        print("Unique Categories in Database:", unique_categories_list)

        # Return the unique categories as a response
        return JsonResponse({"unique_categories": unique_categories_list})

    except Exception as e:
        print(f"Error retrieving unique categories: {e}")
        return JsonResponse({"error": f"Could not retrieve unique categories: {str(e)}"}, status=500)
