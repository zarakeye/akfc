'use client';

import { JSX, useActionState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import TextEditor from '@/components/admin/TextEditor';
import { createCourseAction } from '@server/actions/createCourse.action';
import type { CreateCourseState } from '@server/actions/actionState.interfaces';

type FormValues = {
  label: string;
  Content: JSON;
  beginAtHour: number;
  beginAtMinute: number;
  endAtHour: number;
  endAtMinute: number;
  day: string;
  createAt: Date;
  updateAt: Date;
};

export default function CreateCourseForm(): JSX.Element {
  const form = useForm<FormValues>({
    defaultValues: {
      label: '',
      Content: {},
      beginAtHour: 0,
      beginAtMinute: 0,
      endAtHour: 0,
      endAtMinute: 0,
      day: '',
      createAt: new Date(),
      updateAt: new Date(),
    },
    mode: 'onBlur',
  });

  const [state, formAction, isPending] = useActionState<CreateCourseState, FormData>(createCourseAction, { success: false } as CreateCourseState);

  const days_FR: string[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const days_EN: string[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  const values = form.watch();

  return (
    <form
      action={formAction}
      onSubmit={async (e) => {
        const valid = await form.trigger();
          if (!valid) e.preventDefault();

          // const values = form.getValues();
          // const beginAt = values.beginAtHour * 60 + values.beginAtMinute;
          // const endAt = values.endAtHour * 60 + values.endAtMinute;

          // const formData = new FormData();
          // formData.set('beginAt', beginAt.toString());
          // formData.set('endAt', endAt.toString());
          // console.log("Form Values:", values);
          // console.log("FormData : ", formData);

          // e.preventDefault();
        }}
        className="space-y-4 w-80"
    >
      <div>
        <label htmlFor="label">Label</label>
        <input
          id="label"
          type="text"
          {...form.register('label')}
          className="w-full border border-gray-300 rounded px-2 py-1"
        />
      </div>
      <div>
        <label htmlFor="content">Content</label>
        <Controller
          control={form.control}
          name="Content"
          render={({ field }) => (
            <>
              <TextEditor
                value={field.value}
                onChange={(value) => field.onChange(value)}
              />
              <input
                type="hidden"
                name="content"
                value={JSON.stringify(field.value)}
              />
            </>  
          )}
        />
      </div>

      <div className='flex gap-2 items-center border-gray-300'>
        <label htmlFor="beginAtHour" className='w-2.5 mr-3'>De</label>
        <input
          id="beginAtHour"
          type="number"
          min={0}
          max={23}
          {...form.register('beginAtHour')}
          className="w-16 border rounded px-2 py-1"
        />
        :
        <input
          id="beginAtMinute"
          type="number"
          min={0}
          max={59}
          {...form.register("beginAtMinute", { valueAsNumber: true })}
          className="w-16 border rounded px-2 py-1"
        />
      </div>

      <div className='flex gap-2 items-center border-gray-300'>
        <label htmlFor="endAtHour" className='w-2.5 mr-3'>à</label>
        <input
          id="endAtHour"
          type="number"
          min={0}
          max={23}
          {...form.register('endAtHour')}
          className="w-16 border rounded px-2 py-1"
        />
        :
        <input
          id="endAtMinute"
          type="number"
          min={0}
          max={59}
          {...form.register("endAtMinute", { valueAsNumber: true })}
          className="w-16 border rounded px-2 py-1"
        />
      </div>
      <input type="hidden" name="beginAt" value={values.beginAtHour * 60 + values.beginAtMinute} />
      <input type="hidden" name="endAt" value={values.endAtHour * 60 + values.endAtMinute} />
      <div>
        <label htmlFor="day">le </label>
        {/* <input
          id="day"
          type="text"
          {...form.register('day')}
          className="w-full border border-gray-300 rounded px-2 py-1"
        /> */}
        <select name="day" id="day">
          {days_EN.map((day) => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
      </div>

      {/* Add other form fields for beginAt, endAt, day, coachId as needed */}
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {isPending ? 'Creating...' : 'Create Course'}
      </button>

      {state.error && <p className="text-red-500">{state.error}</p>}
      {state.success && <p className="text-green-500">Course created successfully!</p>}
    </form>
  );
}