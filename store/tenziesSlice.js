import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getBestScore, saveBestScore } from '../utils/storage';

const generateDie = () => ({
  value: Math.ceil(Math.random() * 6),
  isHeld: false,
  id: Math.random().toString(),
})

export const loadBestScore = createAsyncThunk("tenzies/loadBestScore",
  async() => {
    return await getBestScore();
  }
)

const generateDice = () => {
  return Array.from({ length: 10 }, generateDie)
}

const initialState = {
  dice: generateDice(),
  rolls: 0,
  time: 0,
  tenzies: false,
  bestScore: 0,
}

const tenziesSlice = createSlice({
  name: 'tenzies',
  initialState,
  reducers: {
    rollDice(state) {
      if (!state.tenzies) {
        state.dice = state.dice.map(d =>
          d.isHeld ? d : generateDie()
        )
        state.rolls += 1
      }
    },

    holdDie(state, action) {
      state.dice = state.dice.map(d =>
        d.id === action.payload ? { ...d, isHeld: !d.isHeld } : d
      )

      const allHeld = state.dice.every(d => d.isHeld)
      const sameValue = state.dice.every(
        d => d.value === state.dice[0].value
      )

      if (allHeld && sameValue) {
        state.tenzies = true

        const score = Math.max(
          10000 - (state.rolls * 100 + state.time * 10),
          0
        )
        if(score > state.bestScore) {
          state.bestScore = score;
          saveBestScore(score);
        }
      }
    },

    tick(state) {
      if (!state.tenzies) {
        state.time += 1
      }
    },

    newGame(state) {
      state.dice = generateDice()
      state.rolls = 0
      state.time = 0
      state.tenzies = false
    },
  },
  extraReducers: builder => {
  builder.addCase(loadBestScore.fulfilled, (state, action) => {
    state.bestScore = action.payload;
  })
}
})

export const { rollDice, holdDie, tick, newGame } = tenziesSlice.actions
export default tenziesSlice.reducer
