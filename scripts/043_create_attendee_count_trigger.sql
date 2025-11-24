-- Create trigger to automatically update event attendee count
CREATE OR REPLACE FUNCTION public.increment_event_attendees()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'registered' THEN
    UPDATE public.events
    SET current_attendees = COALESCE(current_attendees, 0) + 1
    WHERE id = NEW.event_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to decrement when attendee is deleted or status changed
CREATE OR REPLACE FUNCTION public.update_event_attendees()
RETURNS TRIGGER AS $$
BEGIN
  -- If deleting or changing status from registered to something else
  IF TG_OP = 'DELETE' AND OLD.status = 'registered' THEN
    UPDATE public.events
    SET current_attendees = GREATEST(0, COALESCE(current_attendees, 0) - 1)
    WHERE id = OLD.event_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'registered' AND NEW.status != 'registered' THEN
    UPDATE public.events
    SET current_attendees = GREATEST(0, COALESCE(current_attendees, 0) - 1)
    WHERE id = OLD.event_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'registered' AND NEW.status = 'registered' THEN
    UPDATE public.events
    SET current_attendees = COALESCE(current_attendees, 0) + 1
    WHERE id = NEW.event_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_increment_event_attendees ON public.event_attendees;
DROP TRIGGER IF EXISTS trigger_update_event_attendees ON public.event_attendees;

-- Create trigger for INSERT
CREATE TRIGGER trigger_increment_event_attendees
AFTER INSERT ON public.event_attendees
FOR EACH ROW
EXECUTE FUNCTION public.increment_event_attendees();

-- Create trigger for UPDATE and DELETE
CREATE TRIGGER trigger_update_event_attendees
AFTER UPDATE OR DELETE ON public.event_attendees
FOR EACH ROW
EXECUTE FUNCTION public.update_event_attendees();
