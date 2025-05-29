import { Exercise, ValidateExercise } from '../models/Exercise';

export const createExercise = async (data: any) => {
    try {
        const { error, value } = ValidateExercise.validate(data);
        if (error) {
            return {
            status: 'error',
            message: error.message
            };
        }
        const exercise = await Exercise.create(value);
        return {
            status: 'success',
            message: 'Exercise created successfully',
            data: exercise
        };
    } catch (error) {
        return {
            status: 'error',
            message: 'Failed to create exercise',
            error: error
        };
    }
}
export const getExerciseById = async (id: string) => {
    try {
        const exercise = await Exercise.findById(id);
        return {
            status: 'success',
            message: 'Exercise retrieved successfully',
            data: exercise
        };
    } catch (error) {
        return {
            status: 'error',
            message: 'Failed to retrieve exercise',
            error: error
        };
    }
}

export const getAllExercises = async () => {
    try {
        const exercises = await Exercise.find();
        return {
            status: 'success',
            message: 'Exercises retrieved successfully',
            data: exercises
        };
    } catch (error) {
        return {
            status: 'error',
            message: 'Failed to retrieve exercises',
            error: error
        };
    }
}

export const updateExercise = async (id: string, data: any) => {
    try {
        const { error, value } = ValidateExercise.validate(data);
        if (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
        const exercise = await Exercise.findByIdAndUpdate(id, value, { new: true });
        return {
            status: 'success',
            message: 'Exercise updated successfully',
            data: exercise
        };
    } catch (error) {
        return {
            status: 'error',
            message: 'Failed to update exercise',
            error: error
        };
    }
}

export const deleteExercise = async (id: string) => {
    try {
        await Exercise.findByIdAndDelete(id);
        return {
            status: 'success',
            message: 'Exercise deleted successfully'
        };
    } catch (error) {
        return {
            status: 'error',
            message: 'Failed to delete exercise',
            error: error
        };
    }
}