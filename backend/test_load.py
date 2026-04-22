from model_inference import get_detector

try:
    detector = get_detector()
    print('Initialization and weight loading passed!')
except Exception as e:
    print(f'Error loading: {e}')
