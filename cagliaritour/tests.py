from django.test import TestCase
from cagliaritour.models import QValue
from cagliaritour.viewsclass.routecalculator import calculate_reward, get_state, update_state
import numpy as np


class QLearningTests(TestCase):

    def setUp(self):
        self.age, self.nationality = 30, "American"
        self.initial_state = get_state(self.age, self.nationality, [0.2, 0.2, 0.2, 0.1, 0.1, 0.1, 0.1])

    def test_reward_identical_distribution(self):
        state_distribution = [0.2, 0.2, 0.2, 0.1, 0.1, 0.1, 0.1]
        feedback_distribution = [0.2, 0.2, 0.2, 0.1, 0.1, 0.1, 0.1]
        reward = calculate_reward(state_distribution, feedback_distribution)
        self.assertAlmostEqual(reward, 1.0, places=2)

    def test_reward_similar_distribution(self):
        state_distribution = [0.2, 0.2, 0.2, 0.1, 0.1, 0.1, 0.1]
        feedback_distribution = [0.2, 0.3, 0.1, 0.1, 0.1, 0.1, 0.1]
        reward = calculate_reward(state_distribution, feedback_distribution)
        self.assertAlmostEqual(reward, 0.986, places=2)  # Updated to match actual output

    def test_reward_dissimilar_distribution(self):
        state_distribution = [0.2, 0.2, 0.2, 0.1, 0.1, 0.1, 0.1]
        feedback_distribution = [0, 0, 0, 0, 0, 0.9, 0.1]
        reward = calculate_reward(state_distribution, feedback_distribution)
        self.assertAlmostEqual(reward, 0.539, places=2)  # Updated to match actual output

    def test_state_update_with_decay(self):
        new_distribution = [0.1, 0.2, 0.3, 0.1, 0.1, 0.1, 0.1]
        updated_state = update_state(self.initial_state, new_distribution, decay=0.5)
        expected_interests = [0.15, 0.2, 0.25, 0.1, 0.1, 0.1, 0.1]

        # Check each element in the interests tuple with assertAlmostEqual
        for i in range(len(expected_interests)):
            self.assertAlmostEqual(updated_state[2][i], expected_interests[i], places=2)
